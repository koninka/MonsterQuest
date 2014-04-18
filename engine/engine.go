package engine

import (
    "database/sql"
    "time"
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "MonsterQuest/gameMap"
    "MonsterQuest/gameObjects"
    "MonsterQuest/gameObjectsBase"
)

type Game struct {
    websocketHub
    field gameMap.GameField
    players playerList
    mobs mobList
    lastActions map[string] consts.JsonType
    msgsChannel chan consts.JsonType
    id2conn map[int64] *connection
    dictionary consts.JsonType
}

var gameInstance *Game
var lastId int64 = -1

func GenerateId() int64 {
    lastId++
    return lastId
}

func GetInstance() *Game {
    if gameInstance == nil {
        gameInstance = &Game{
            websocketHub{
                broadcast:   make(chan interface{}),
                register:    make(chan *connection),
                unregister:  make(chan *connection),
                connections: make(map[*connection] bool),
            },
            gameMap.NewGameField(),
			playerList{
                make(map[int64] *gameObjects.Player),
                make(map[string] *gameObjects.Player),
            },
            mobList{
                make(map[int64] *gameObjects.Mob),
                make([] *mobGenerator, 0, 1000),
                make(chan gameObjects.Mob),
                make(map[int64] []*gameObjects.MobKind),
            },
            make(map[string] consts.JsonType),
            make(chan consts.JsonType),
            make(map[int64] *connection),
            //make(consts.JsonType),
            nil,
        }
        gameInstance.field.LoadFromFile("map.txt")
        gameInstance.dictionary = gameInstance.mobs.initializeMobTypes()
        gameInstance.mobs.initializeMobsGenerators("areas.txt")
        gameInstance.initializeDictionary()
        go gameInstance.readInGameMsgs()
        go gameInstance.mobs.run()
        go gameInstance.websocketHub.run()
        go gameInstance.players.save()
    }
    return gameInstance
}

func (g *Game) initializeDictionary(){
    g.dictionary["."] = "grass"
    g.dictionary["#"] = "wall"
}

func (g *Game) notifyAboutAttack(msg consts.JsonType) {
    notifyMsg := make(consts.JsonType)
    attacker := msg["attacker"].(gameObjectsBase.Activer)
    target := msg["target"].(gameObjectsBase.Activer)
    notifyMsg["action"] = "attack"
    notifyMsg["attacker"] = attacker.GetID()
    notifyMsg["target"] = target.GetID()
    notifyMsg["description"] = msg["description"]
    if msg["killed"] != nil {
        notifyMsg["killed"] = true
    }
    lt, rb := g.field.GetVisibleArea(attacker.GetCenter().X, attacker.GetCenter().Y, consts.VISION_RADIUS)
    notified := make(map[int64] bool)
    for i := int(lt.Y); i < int(rb.Y); i++ {
        for j := int(lt.X); j < int(rb.X); j++ {
            for _, actor := range g.field.Actors[i][j] {
                id := actor.GetID()
                if !notified[id] {
                    notified[id] = true
                    conn := g.id2conn[id]
                    if conn != nil {
                        conn.send <- notifyMsg
                    }
                }
            }
        }
    }
}

func (g *Game) readInGameMsgs() {
    for {
        msg := <-g.msgsChannel
        if msg["action"].(string) == "attack" {
            go g.notifyAboutAttack(msg)
            if msg["killed"] == true {
                go g.mobs.takeAwayMob(msg["target"].(*gameObjects.Mob))
            }
        }
    }
}

func (g *Game) sendTick(tick int64) {
    data := map[string] int64 {"tick" : tick}
    g.broadcast <- data
}

func (g *Game) AddConnection(conn *connection) {
    g.register <- conn
    go conn.writePump()
    go conn.readPump()
}

func (g *Game) CloseConnection(conn *connection) {
    g.unregister <- conn
}

func (g *Game) linkConnectionWithPlayer(sid string, conn *connection) {
    id := g.players.getPlayerBySession(sid).GetID()
    if g.id2conn[id] == nil {
        g.id2conn[id] = conn
    }
}

func (g *Game) CheckOutPlayersAction(conn *connection, json consts.JsonType) {
    action, ok := json["action"].(string)
    if !ok {
        conn.send <- g.badAction("")
        return
    }
    g.linkConnectionWithPlayer(json["sid"].(string), conn)
    switch action {
    case "move": g.moveAction(json)
    case "attack": g.attackAction(json)
    case "getDictionary": conn.send <- g.getDictionaryAction()
    case "look": conn.send <- g.lookAction(json["sid"].(string))
    case "examine": conn.send <- g.examineAction(json)
    case "startTesting" : conn.send <- g.startTesting()
    case "endTesting"   : conn.send <- g.endTesting()
    case "setUpMap" : conn.send <- g.setUpMap(json)
    default: conn.send <- g.badAction(action)
    }
}

func (g *Game) moveAction(json consts.JsonType) {
    p := g.players.getPlayerBySession(json["sid"].(string))
    p.SetDir(g.getIotaDir(json["direction"].(string)))
}

func (g *Game) attackAction(json consts.JsonType) {
    if obj, isExist := g.getObjectById(int64(json["id"].(float64))); isExist {
        g.players.getPlayerBySession(json["sid"].(string)).SetTarget(obj)
    }
}

func (g *Game) inDictionary(k string) bool {
    return g.dictionary[k] != nil
}

func (g *Game) setUpMap(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "setUpMap"
    res["result"] = "badAction"
    loadingFailed := func () consts.JsonType {
        res["result"] = "badMap"
        return res
    }

    if *consts.TEST && consts.TEST_MODE {
        var mapStrs []string
        data, ok := json["map"].([]interface{})
        if ok {
             for _, arr := range data {
                var str string
                chars, ok := arr.([]interface{})
                if ok {
                    for _, el := range chars {
                        char, ok := el.(string)
                        if ok && g.inDictionary(char) {
                            str += char
                        } else {
                            return loadingFailed()
                        }
                    }
                } else {
                    return loadingFailed()
                }
                mapStrs = append(mapStrs, str)
            }
        } else {
            return loadingFailed()
        }

        if !g.field.LoadFromStrings(mapStrs) {
            return loadingFailed()
        }

        res["result"] = "ok"
    }

    return res;
}

func (g* Game) badAction(action string) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = action
    res["result"] = "badAction"
    return res
}

func (g *Game) startTesting() consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "startTesting"
    res["result"] = "badAction"
    if *consts.TEST && !consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = true
    }
    return res
}

func (g *Game) endTesting() consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "endTesting"
    res["result"] = "badAction"
    if *consts.TEST && consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = false
    }
    return res
}

func (g *Game) getDictionaryAction() consts.JsonType {
    res := make(consts.JsonType)
    for k, v := range g.dictionary {
        res[k] = v
    }
    res["action"] = "getDictionary"
    res["result"] = "ok"
    return res
}

func (g *Game) CreatePlayer(sid string) int64 {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(`
        SELECT u.id, u.login, up.x, up.y
        FROM users u
        INNER JOIN users_position as up ON u.id = up.user_id
        INNER JOIN sessions s ON s.user_id = u.id AND s.sid = ?
    `)
    defer stmt.Close()
    var dbId int64
    var login string
    var x, y float64
    stmt.QueryRow(sid).Scan(&dbId, &login, &x, &y)
    return g.players.add(sid, login, x, y, GenerateId(), dbId).GetID()
}

func (g *Game) getObjectById(id int64) (gameObjectsBase.Activer, bool) {
    if g.players.players[id] != nil {
        return g.players.players[id], true
    } else if g.mobs.mobs[id] != nil {
        return g.mobs.mobs[id], true
    } else {
        return nil, false
    }
}

func (g *Game) examineAction(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    id := int64(json["id"].(float64))
    res["action"] = "examine"
    obj, isExists := g.getObjectById(id)
    if !isExists {
        res["result"] = "badId"
    } else {
        center := obj.GetCenter()
        res["result"] = "ok"
        res["type"] = obj.GetType()
        res["id"] = id
        res["x"] = center.X
        res["y"] = center.Y
        res["symbol"] = obj.GetKind().GetSymbol()
        info := obj.GetInfo()
        for k, v := range info {
            res[k] = v
        }
    }
    return res
}

func (g *Game) lookAction(sid string) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "look"
    player := g.players.getPlayerBySession(sid)
    if player == nil {
        return nil
    }
    visibleSpaceSide := 2 * (consts.VISION_RADIUS + 1)
    visibleSpace := make([][]string, visibleSpaceSide)
    for i := 0; i < visibleSpaceSide; i++ {
        visibleSpace[i] = make([]string, visibleSpaceSide)
        for j := 0; j < visibleSpaceSide; j++ {
            visibleSpace[i][j] = "#"
        }
    }
    px, py := int(player.Center.X), int(player.Center.Y)
    var scol, srow int
    r := player.GetRadiusVision() + 1
    if px - r < 0 {
        scol = r - px
    }
    if py - r < 0 {
        srow = r - py
    }
    lt, rb := g.field.GetVisibleArea(player.Center.X, player.Center.Y, player.GetRadiusVision())
    l, r := int(lt.X), int(rb.X)
    t, b := int(lt.Y), int(rb.Y)
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            visibleSpace[i - t + srow][j - l + scol] = string(g.field.Field[i][j])
        }
    }
    res["map"] = visibleSpace
    visibleActors := make([]consts.JsonType, 0, 1000)
    var addedActors = map[int64] bool {player.GetID() : true}
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            for id, obj := range g.field.Actors[i][j] {
                if !addedActors[id] {
                    json := make(consts.JsonType)
                    center := obj.GetCenter()
                    json["id"] = id
                    json["x"] = center.X
                    json["y"] = center.Y
                    json["type"] = obj.GetType()
                    json["symbol"] = obj.GetKind().GetSymbol()
                    visibleActors = append(visibleActors, json)
                    addedActors[id] = true
                }
            }
        }
    }
    res["actors"] = visibleActors
	res["x"] = player.Center.X
	res["y"] = player.Center.Y
    return res
}


func (g *Game) getIotaDir(dir string) int {
    var res int
    switch dir {
    case "north": res = consts.NORTH_DIR
    case "south": res = consts.SOUTH_DIR
    case "west" : res = consts.WEST_DIR
    case "east" : res = consts.EAST_DIR
    }
    return res
}

func (g *Game) updateWorld() {
    for _, p := range g.players.players {
        p.Do()
    }
    for _, m := range g.mobs.mobs {
        m.Do()
    }
}

func (g *Game) IsSIDValid(sid string) bool {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(connect.MakeSelect("sessions", "sid = ?", "id"))
    defer stmt.Close()
    return stmt.QueryRow(sid).Scan() != sql.ErrNoRows
}

func (g *Game) LogoutPlayer(sid string) {
    delete(g.id2conn, g.players.getPlayerBySession(sid).GetID())
    g.field.UnlinkActorFromCells(g.players.getPlayerBySession(sid))
    g.players.deletePlayerBySession(sid)
}

func GameLoop() {
    gameInstance = GetInstance()
    var tick int64
    for {
        tick++
        gameInstance.updateWorld()
        gameInstance.sendTick(tick)
        time.Sleep(consts.TICK_DURATION)
    }
}
