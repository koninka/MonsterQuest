package engine

import (
    "database/sql"
    "time"
    "fmt"
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
                make(chan *gameObjects.Mob),
                make(map[int64] []*gameObjects.MobKind),
            },
            itemList{
                make(map[int64] gameObjectsBase.Itemer),
            },
            make(map[string] consts.JsonType),
            make(chan consts.JsonType),
            make(map[int64] *connection),
            make(map[*connection] int64),
            make(consts.JsonType),
        }
        gameObjectsBase.InitGameItems()
        gameInstance.field.LoadFromFile("map.txt")
        gameInstance.dictionary = gameInstance.mobs.initializeMobTypes()
        if !*consts.TEST {
            gameInstance.mobs.initializeMobsGenerators("areas.txt")
            go gameInstance.players.save()
        }
        gameInstance.initializeDictionary()
        go gameInstance.mobs.run()
        go gameInstance.websocketHub.run()
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
    if action != "look" && action != "move" {
        fmt.Println(json)
    }
    switch action {
    case "move": g.moveAction(json)
    case "useItem": g.useItemAction(json)
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
    case "moveItem" : conn.send <- g.moveItem(json)
    case "getConst" : conn.send <- g.getConstants()
    case "setUpConst" : conn.send <- g.setUpConstants(json)
    default: conn.send <- g.badAction(action)
    }
}

func (g *Game) moveItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("moveItem", "badId")
    idParam := json["id"]
    cellParam := json["cell"]
    if cellParam == nil {
        res["result"] = "badCell"
    } else if idParam != nil {
        cell := int(cellParam.(float64))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if p.MoveItem(p.Inventory.GetItem(int64(idParam.(float64))), cell) {
            res["result"] = "ok"
        }
    }
    return res;
}

func (g *Game) pickUpItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("pickUp", "badId")
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && !item.HasOwner() && geometry.Distance(p.GetCenter(), item.GetCenter()) <= float64(consts.PICK_UP_RADIUS) {
            if p.CanPickUp(item) {
                if p.PickUpItem(item) {
                    g.field.UnlinkFromCells(item)
                    res["result"] = "ok"
                }
            } else {
                res["result"] = "tooHeavy"
            }
        }
    }
    fmt.Println(res)
    return res
}

func (g *Game) dropItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("drop", "badId")
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && item.IsOwner(p) {
            _, new_item := p.DropItem(item, 1)//second param must me amount
            if new_item != nil {
                new_item.SetID(utils.GenerateId())
                g.items.addItem(new_item)
            }
            g.field.LinkToCells(item)
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) destroyItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("destroyItem", "badId")
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && (item.IsOwner(p) || (!item.HasOwner() && geometry.Distance(p.GetCenter(), item.GetCenter()) < consts.PICK_UP_RADIUS)) {
            g.items.deleteItem(item)
            if item.IsOwner(p) {
                p.DeleteItem(item)
            }
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) equipItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("equip", "badId")
    idParam := json["id"]
    slotParam := json["slot"]
    if slotParam == nil {
        res["result"] = "badSlot"
    } else if idParam != nil {
        p := g.players.getPlayerBySession(json["sid"].(string))
        item := p.GetItem(int64(idParam.(float64)))
        if item != nil {
            if p.Equip(item, consts.NameSlotMapping[slotParam.(string)]) {
                res["result"] = "ok"
            } else {
                res["result"] = "badSlot"
            }
        }
    }
    return res
}

func (g *Game) unequipItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("unequip", "badSlot")
    slotParam := json["slot"]
    if slotParam != nil {
        p := g.players.getPlayerBySession(json["sid"].(string))
        if p.Unequip(consts.NameSlotMapping[slotParam.(string)]) {
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) moveAction(json consts.JsonType) {
    p := g.players.getPlayerBySession(json["sid"].(string))
    p.SetDir(g.getIotaDir(json["direction"].(string)))
}

func (g *Game) useItemAction(json consts.JsonType) consts.JsonType {
    return g.players.getPlayerBySession(json["sid"].(string)).UseItem(int64(json["id"].(float64)))
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

func (g *Game) setUpConstants(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("setUpConst", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        for name, val := range consts.ConstNameMapping {
            if json[name] != nil {
                val = json[name]
                fmt.Println(val) // todo: check
            }
        }
        res["result"] = "ok"
    }
    return res
}

func (g *Game) getConstants() consts.JsonType {
    res := utils.JsonAction("setUpConst", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        for name, val := range consts.ConstNameMapping {
            res[name] = val
        }
    }
    return res
}

func (g *Game) setUpMap(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("setUpMap", "badAction")
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
    return utils.JsonAction(action, "badAction")
}

func (g *Game) startTesting() consts.JsonType {
    res := utils.JsonAction("startTesting", "badAction")
    if *consts.TEST && !consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = true
    }
    return res
}

func (g *Game) endTesting() consts.JsonType {
    res := utils.JsonAction("endTesting", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        res["result"] = "ok"
        consts.TEST_MODE = false
    }
    return res
}

func (g *Game) getDictionaryAction() consts.JsonType {
    dict := make(consts.JsonType)
    for k, v := range g.dictionary {
        dict[k] = v
    }
    res := utils.JsonAction("getDictionary", "ok")
    res["dictionary"] = dict
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
    p := gameObjects.NewPlayer(utils.GenerateId(), dbId, login, sid, x, y)
    g.players.add(p)
    rows, _ := db.Query("SELECT item_id, amount, place FROM users_inventory WHERE user_id = ?", dbId)
    for rows.Next() {
        var (
            iid int64
            amount, place int
        )
        rows.Scan(&iid, &amount, &place)
        item := gameObjectsBase.NewItem(iid, p)
        p.RestoreItem(item, place)
        g.items.addItem(item)
    }
    return p.GetID()
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
    res := utils.JsonAction("examine", "badId")
    idParam := json["id"]
    if idParam != nil {
        id := int64(idParam.(float64))
        obj, isExists := g.getObjectById(id)
        if isExists {
            for k, v := range obj.GetFullInfo() {
                res[k] = v
            }
            p := g.players.getPlayerBySession(json["sid"].(string))
            if p.GetID() == id {
                res["inventory"] = p.GetInventoryInfo()
            }
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) lookAction(sid string) consts.JsonType {
    res := utils.JsonAction("look", "ok")
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
    p := g.players.getPlayerBySession(sid)
    delete(g.id2conn, p.GetID())
    g.field.UnlinkFromCells(p)
    for _, item := range p.GetItems() {
        g.items.deleteItem(item)
    }
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
