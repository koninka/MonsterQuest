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

type jsonType map[string] interface{}

type Game struct {
    websocketHub
    field gameMap.GameField
    players playerList
    mobs mobList
    lastActions map[string] jsonType
}

var gameInstance *Game
var lastId int64 = -1

func GenerateId() int64 {
    lastId++
    return lastId
}

func getGameField() *gameMap.GameField {
    return &GetInstance().field
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
                make(map[int64] gameObjects.Mober),
                make([] *mobGenerator, 0, 1000),
                make(chan gameObjects.Mober),
                make(map[int64] *gameObjects.MobKind),
            },
            make(map[string] jsonType),
        }
        gameInstance.field.LoadFromFile("map.txt")
        gameInstance.mobs.initializeMobTypes()
        gameInstance.mobs.initializeMobsGenerators("areas.txt")
        go gameInstance.mobs.run()
        go gameInstance.websocketHub.run()
        go gameInstance.players.save()
    }
    return gameInstance
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

func (g *Game) CheckOutPlayersAction(conn *connection, json jsonType) {
    action, ok := json["action"].(string)
    if !ok {
        conn.send <- g.badAction("")
        return
    }
    switch action {
    case "move": g.moveAction(json)
    case "getDictionary": conn.send <- g.getDictionaryAction()
    case "look": conn.send <- g.lookAction(json["sid"].(string))
    case "examine": conn.send <- g.examineAction(json)
    case "startTesting" : conn.send <- g.startTesting()
    case "endTesting"   : conn.send <- g.endTesting()
    case "setUpMap" : conn.send <- g.setUpMap(json)
    default: conn.send <- g.badAction(action)
    }
}

func (g *Game) moveAction(json jsonType) {
    p := g.players.getPlayerBySession(json["sid"].(string))
    p.SetDir(g.getIotaDir(json["direction"].(string)))
}

func (g *Game) inDictionary(k string) bool {
    return g.getDictionaryAction()[k] != nil
}

func (g *Game) setUpMap(json jsonType) jsonType {
    res := make(jsonType)
    res["action"] = "setUpMap"
    res["result"] = "badAction"
    loadingFailed := func () jsonType {
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

func (g* Game) badAction(action string) jsonType {
    res := make(jsonType)
    res["action"] = action
    res["result"] = "badAction"
    return res
}

func (g *Game) startTesting() jsonType {
    res := make(jsonType)
    res["action"] = "startTesting"
    res["result"] = "badAction"
    if *consts.TEST && !consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = true
    }
    return res
}

func (g *Game) endTesting() jsonType {
    res := make(jsonType)
    res["action"] = "endTesting"
    res["result"] = "badAction"
    if *consts.TEST && consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = false
    }
    return res
}

func (g *Game) getDictionaryAction() jsonType {
    res := make(jsonType)
    res["action"] = "getDictionary"
    res["result"] = "ok"
    res["."] = "grass"
    res["#"] = "wall"
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

func (g *Game) examineAction(json jsonType) jsonType {
    res := make(jsonType)
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
        info := obj.GetInfo()
        for k, v := range info {
            res[k] = v
        }
    }
    return res
}

func (g *Game) getVisibleSpace(coord, bound int) (v1 int, v2 int, shift int) {
    shift = 0
    r := consts.VISION_RADIUS + 1
    if coord - r < 0 {
        v1 = 0
        shift = - (coord - r)
    } else {
        v1 = coord - r
    }
    if coord + r > bound {
        v2 = bound
    } else {
        v2 = coord + r
    }
    return
}

func (g *Game) lookAction(sid string) jsonType {
    res := make(jsonType)
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
    l, r, scol := g.getVisibleSpace(int(player.Center.X), g.field.Width - 1)
    t, b, srow := g.getVisibleSpace(int(player.Center.Y), g.field.Height - 1)
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            visibleSpace[i - t + srow][j - l + scol] = string(g.field.Field[i][j])
        }
    }
    res["map"] = visibleSpace
    visibleActors := make([]jsonType, 0, 1000)
    var addedActors = map[int64] bool {player.GetID() : true}
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            for id, obj := range g.field.Actors[i][j] {
                if !addedActors[id] {
                    json := make(jsonType)
                    center := obj.GetCenter()
                    json["id"] = id
                    json["x"] = center.X
                    json["y"] = center.Y
                    json["type"] = obj.GetType()
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
    /*for k, v := range g.lastActions {
        action := v["action"].(string)
        p := g.players.getPlayerBySession(k)
        if action == "move" {
            g.moveActor(p, g.getIotaDir(v["direction"].(string)))
        }
        delete(g.lastActions, k)
    }
    for _, m := range g.mobs.mobs {
        dir := m.CurrDirection()
        if g.moveActor(m, dir) {
            go m.NotifyAboutCollision()
        }
        m.Do()
    }*/

}

func (g *Game) IsSIDValid(sid string) bool {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(connect.MakeSelect("sessions", "sid = ?", "id"))
    defer stmt.Close()
    return stmt.QueryRow(sid).Scan() != sql.ErrNoRows
}

func (g *Game) LogoutPlayer(sid string) {
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
