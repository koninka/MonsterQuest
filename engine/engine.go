package engine

import (
    "database/sql"
    "time"
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "MonsterQuest/utils"
    "MonsterQuest/gameMap"
    "MonsterQuest/gameObjects"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/notifier"
    "MonsterQuest/geometry"
)

type Game struct {
    websocketHub
    field gameMap.GameField
    players playerList
    mobs mobList
    items itemList
    lastActions map[string] consts.JsonType
    msgsChannel chan consts.JsonType
    id2conn map[int64] *connection
    conn2id map[*connection] int64
    dictionary consts.JsonType
}

var gameInstance *Game

func GetInstance() *Game {
    if gameInstance == nil {
        gameInstance = &Game{
            websocketHub{
                broadcast:   make(chan consts.JsonType),
                register:    make(chan *connection),
                unregister:  make(chan *connection),
                connections: make(map[*connection] bool),
                ticks:       make(chan int64),
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
            itemList{
                make(map[int64] *gameObjectsBase.Item),
            },
            make(map[string] consts.JsonType),
            make(chan consts.JsonType),
            make(map[int64] *connection),
            make(map[*connection] int64),
            nil,
        }
        gameObjectsBase.InitGameItems()
        gameInstance.field.LoadFromFile("map.txt")
        gameInstance.dictionary = gameInstance.mobs.initializeMobTypes()
        gameInstance.mobs.initializeMobsGenerators("areas.txt")
        gameInstance.initializeDictionary()
        go gameInstance.mobs.run()
        go gameInstance.websocketHub.run()
        go gameInstance.players.save()
        notifier.GameNotifier = gameInstance
    }
    return gameInstance
}

func (g *Game) initializeDictionary(){
    g.dictionary[string(consts.GRASS_SYMBOL)] = "grass"
    g.dictionary[string(consts.WALL_SYMBOL)] = "wall"
}

func (g *Game) NotifyAboutAttack(attacker, target gameObjectsBase.Activer, msg consts.JsonType) {
    lt, rb := g.field.GetVisibleArea(attacker.GetCenter().X, attacker.GetCenter().Y, consts.VISION_RADIUS)
    notified := make(map[int64]bool)
    for i := int(lt.Y); i < int(rb.Y); i++ {
        for j := int(lt.X); j < int(rb.X); j++ {
            for _, actor := range g.field.GetActors(i, j) {
                id := actor.GetID()
                if !notified[id] {
                    notified[id] = true
                    conn := g.id2conn[id]
                    if conn != nil {
                        conn.AddNotification(msg)
                    }
                }
            }
        }
    }
    t, isMob := target.(*gameObjects.Mob)
    if msg["killed"] == true && isMob {
        go g.mobs.takeAwayMob(t)
    }
}

func (g *Game) sendTick(tick int64) {
    g.ticks <- tick
}

func (g *Game) AddConnection(conn *connection) {
    g.register <- conn
    go conn.writePump()
    go conn.readPump()
}

func (g *Game) CloseConnection(conn *connection) {
    g.unregister <- conn
    delete(g.id2conn, g.conn2id[conn])
    delete(g.conn2id, conn)
}

func (g *Game) linkConnectionWithPlayer(sid string, conn *connection) {
    id := g.players.getPlayerBySession(sid).GetID()
    if g.id2conn[id] == nil {
        g.id2conn[id] = conn
        g.conn2id[conn] = id
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
    case "pickUp" : conn.send <- g.pickUpItem(json)
    case "drop" : conn.send <- g.dropItem(json)
    case "destroyItem" : conn.send <- g.destroyItem(json)
    case "equip" : conn.send <- g.equipItem(json)
    case "unequip" : conn.send <- g.unequipItem(json)
    default: conn.send <- g.badAction(action)
    }
}

func (g *Game) pickUpItem(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "pickUp"
    idParam := json["id"]
    if idParam == nil {
        res["result"] = "badId"
    } else {
        item := g.items.items[idParam.(int64)]
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && !item.HasOwner() && geometry.Distance(p.GetCenter(), item.GetCenter()) <= float64(consts.PICK_UP_RADIUS) {
            p.AddItem(item)
            item.SetOwner(p)
            g.field.UnlinkFromCells(item)
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) dropItem(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "drop"
    idParam := json["id"]
    if idParam == nil {
        res["result"] = "badId"
    } else {
        item := g.items.items[idParam.(int64)]
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && item.GetOwner() == p {
            p.DropItem(item)
            item.SetOwner(nil)
            item.ForcePlace(p.GetCenter())
            g.field.LinkToCells(item)
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) destroyItem(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "destroyItem"
    idParam := json["id"]
    if idParam == nil {
        res["result"] = "badId"
    } else {
        item := g.items.items[idParam.(int64)]
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item == nil || item.GetOwner() != p || geometry.Distance(p.GetCenter(), item.GetCenter()) > consts.PICK_UP_RADIUS {
            res["result"] = "badId"
        } else {
            g.items.deleteItem(item)
            if item.GetOwner() == p {
                delete(p.GetItems(), idParam.(int64))
            }
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) equipItem(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "equip"
    idParam := json["id"]
    if idParam == nil {
        res["result"] = "badId"
    } else {
        item := g.items.items[idParam.(int64)]
        p := g.players.getPlayerBySession(json["sid"].(string))
        slotParam := json["slot"]
        if item.GetOwner() != p {
            res["result"] = "badId"
        } else if slotParam == nil {
            res["result"] = "badSlot"
        } else if p.Equip(item, slotParam.(string)) {
            res["result"] = "ok"
        } else {
            res["result"] = "badSlot"
        }
    }
    return res
}

func (g *Game) unequipItem(json consts.JsonType) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "unequip"
    slotParam := json["slot"]
    if slotParam == nil {
        res["result"] = "badSlot"
    } else {
        p := g.players.getPlayerBySession(json["sid"].(string))
        if p.Unequip(slotParam.(string)) {
            res["result"] = "ok"
        } else {
            res["result"] = "badSlot"
        }
    }
    return res
}

func (g *Game) moveAction(json consts.JsonType) {
    p := g.players.getPlayerBySession(json["sid"].(string))
    p.SetDir(g.getIotaDir(json["direction"].(string)))
}

func (g *Game) attackAction(json consts.JsonType) {
    pt := json["point"].(map[string] interface{})
    x, ok1 := pt["x"].(float64)
    y, ok2 := pt["y"].(float64)
    if ok1 && ok2 {
        g.players.getPlayerBySession(json["sid"].(string)).SetAttackPoint(float64(x), float64(y))
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
    dict := make(consts.JsonType) 
    res := make(consts.JsonType)
    for k, v := range g.dictionary {
        dict[k] = v
    }
    res["action"] = "getDictionary"
    res["dictionary"] = dict
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
    return g.players.add(sid, login, x, y, utils.GenerateId(), dbId).GetID()
}

func (g *Game) getObjectById(id int64) (gameObjectsBase.GameObjecter, bool) {
    if g.players.players[id] != nil {
        return g.players.players[id], true
    } else if g.mobs.mobs[id] != nil {
        return g.mobs.mobs[id], true
    } else if g.items.items[id] != nil {
        return g.items.items[id], true
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
        for k, v := range obj.GetInfo() {
            res[k] = v
        }
        res["result"] = "ok"
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
            visibleSpace[i][j] = string(consts.WALL_SYMBOL)
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
            visibleSpace[i - t + srow][j - l + scol] = string(g.field.GetBackground(j, i))
        }
    }
    res["map"] = visibleSpace
    visibleObjects := make([]consts.JsonType, 0, 1000)
    var addedObjects = map[int64] bool {player.GetID() : true}
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            for id, obj := range g.field.GetObjects(j, i) {
                if !addedObjects[id] {
                    visibleObjects = append(visibleObjects,  obj.GetInfo())
                    addedObjects[id] = true
                }
            }
        }
    }
    res["actors"] = visibleObjects
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
    g.field.UnlinkFromCells(g.players.getPlayerBySession(sid))
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
