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
    "MonsterQuest/gameObjectsFlags"
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
        gameInstance.dictionary = gameInstance.mobs.initializeMobTypes()
        if !*consts.TEST {
            gameInstance.field.LoadFromFile("map.txt")
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

func (g *Game) doPlayersAction(action string, json consts.JsonType) consts.JsonType {
    var res consts.JsonType
    switch action {
    case "move": g.moveAction(json)
    case "use": res = g.useAction(json)
    case "attack": g.attackAction(json)
    case "getDictionary": res = g.getDictionaryAction()
    case "look": res = g.lookAction(json["sid"].(string))
    case "examine": res = g.examineAction(json)
    case "startTesting" : res = g.startTesting()
    case "stopTesting"  : res = g.stopTesting(json["sid"].(string))
    case "setUpMap" : res = g.setUpMap(json)
    case "pickUp" : res = g.pickUpItem(json)
    case "drop" : res = g.dropItem(json)
    case "destroyItem" : res = g.destroyItem(json)
    case "equip" : res = g.equipItem(json)
    case "unequip" : res = g.unequipItem(json)
    case "moveItem" : res = g.moveItem(json)
    case "getConst" : res = g.getConstants()
    case "setUpConst" : res = g.setUpConstants(json)
    case "putMob" : res = g.putMob(json)
    case "putPlayer" : res = g.putPlayer(json)
    case "putItem" : res = g.putItem(json)
    case "enforce" : res = g.enforceAction(json)
    case "setLocation" : res = g.setLocationAction(json)
    default: res = g.badAction(action)
    }
    return res
}

func (g *Game) CheckOutPlayersAction(conn *connection, json consts.JsonType) {
    action, ok := json["action"].(string)
    if !ok {
        conn.send <- g.badAction("")
        return
    }
    g.linkConnectionWithPlayer(json["sid"].(string), conn)
    if action != "look" && action != "move" {
        fmt.Println("REQUEST ", json)
    }
    res := g.doPlayersAction(action, json)
    if res != nil {
        // if action != "look" && action != "move" {
        //     fmt.Println("RESPONSE ", res)
        // }
        conn.send <- res
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
        fmt.Println("game items ", g.items)
        p := g.players.getPlayerBySession(json["sid"].(string))
        if p.MoveItem(p.Inventory.GetItem(int64(idParam.(float64))), cell) {
            res["result"] = "ok"
        }
    }
    return res;
}

func (g *Game) setLocationAction(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("setLocation", "badPlacing")
    pt, ok := utils.GetPointFromJson(json)
    if ok {
        g.players.getPlayerBySession(json["sid"].(string)).ForcePlace(*pt)
        res["result"] = "ok"
    }
    return res;
}

func (g *Game) pickUpItem(json consts.JsonType) consts.JsonType {
    fmt.Println("game items ", g.items)
    res := utils.JsonAction("pickUp", "badId")
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && !item.HasOwner() && geometry.Distance(p.GetCenter(), item.GetCenter()) <= float64(consts.PICK_UP_RADIUS) {
            if p.CanPickUp(item) {
                ok, i := p.PickUpItem(item)
                if ok {
                    g.field.UnlinkFromCells(item)
                    if item.GetID() != i.GetID() {
                        g.items.deleteItem(item)
                        item = nil
                    }
                    res["result"] = "ok"
                }
            } else {
                res["result"] = "tooHeavy"
            }
        }
    }
    fmt.Println("game items ", g.items)
    return res
}

func (g *Game) dropItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("drop", "badId")
    fmt.Println("game items ", g.items)
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && item.IsOwner(p) {
            var amount int = 1
            if json["amount"] != nil {
                amount = int(json["amount"].(float64))
            }
            _, new_item := p.DropItem(item, amount)
            if new_item != nil {
                g.items.addItem(new_item)
            }
            g.field.LinkToCells(item)
            res["result"] = "ok"
        }
    }
    fmt.Println("game items ", g.items)
    return res
}

func (g *Game) destroyItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("destroyItem", "badId")
    fmt.Println("game items ", g.items)
    idParam := json["id"]
    if idParam != nil {
        item := g.items.getItem(int64(idParam.(float64)))
        p := g.players.getPlayerBySession(json["sid"].(string))
        if item != nil && (item.IsOwner(p) || (!item.HasOwner() && geometry.Distance(p.GetCenter(), item.GetCenter()) <= consts.PICK_UP_RADIUS)) {
            var amount int = 1
            if json["amount"] != nil {
                amount = int(json["amount"].(float64))
            }
            // if item.GetAmount() - amount <= 0 {
            g.items.deleteItem(item)
            if item.IsOwner(p) {
                _, new_item := p.DeleteItem(item, amount)
                if new_item != nil {
                    g.items.addItem(new_item)
                }
            } else if !item.HasOwner() {
                g.field.UnlinkFromCells(item)
            }
            // } else {
            //     item.DecAmount(amount)
            // }
            res["result"] = "ok"
        }
    }
    fmt.Println("game items ", g.items)
    return res
}

func (g *Game) equipItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("equip", "badId")
    idParam := json["id"]
    if idParam != nil {
        res["result"] = "badSlot"
        slotParam := json["slot"]
        if slotParam != nil {
            slot, isExistSlot := consts.NameSlotMapping[slotParam.(string)]
            if isExistSlot {
                p := g.players.getPlayerBySession(json["sid"].(string))
                item := p.GetItem(int64(idParam.(float64)))
                if item != nil {
                    isEquip, slots := p.Equip(item, slot)
                    if isEquip {
                        if slots != nil {
                            res["slots"] = slots
                        }
                        res["result"] = "ok"
                    }
                }
            }
        }
    }
    fmt.Println("EQUIP RESULT ", res)
    return res
}

func (g *Game) unequipItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("unequip", "badSlot")
    slotParam := json["slot"]
    if slotParam != nil {
        slot, isExistSlot := consts.NameSlotMapping[slotParam.(string)]
        if isExistSlot {
            p := g.players.getPlayerBySession(json["sid"].(string))
            isUnequip, slots := p.Unequip(slot)
            if isUnequip {
                res["result"] = "ok"
                if slots != nil {
                    res["slots"] = slots
                }
            }
        }
    }
    fmt.Println("UNEQUIP RESULT ", res)
    return res
}

func (g *Game) moveAction(json consts.JsonType) {
    p := g.players.getPlayerBySession(json["sid"].(string))
    p.SetDir(consts.NameDirMapping[json["direction"].(string)])
}

func (g *Game) useAction(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("use", "badId")
    res["message"] = "some string"
    idParam := json["id"]
    if idParam != nil {
        id := int64(idParam.(float64))
        p := g.players.getPlayerBySession(json["sid"].(string))
        xParam := json["x"]
        yParam := json["y"]
        res["result"] = "badSlot"
        if xParam != nil && yParam != nil {
            if item := p.GetItem(id); item != nil && item.IsWeapon() {
                if p.IsEquippedItem(item) {
                    p.SetAttackPoint(xParam.(float64), yParam.(float64))
                    res["message"] = fmt.Sprintf("attack point (%f, %f)", xParam.(float64), yParam.(float64))
                    res["result"] = "ok"
                }
            }
        } else {
            p.UseItem(int64(json["id"].(float64)))
            res["result"] = "ok"
        }
    }
    return res
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
        var isValidConsts bool = true
        for name, _ := range consts.NameConstMapping {
            if json[name] != nil {
                _, ok := json[name].(float64)
                isValidConsts = isValidConsts && ok
            }
        }
        if isValidConsts {
            for name, constant := range consts.NameConstMapping {
                if json[name] != nil {
                    if v, ok := constant.(*float64); ok {
                        *v = json[name].(float64)
                    } else if v, ok := constant.(*int); ok {
                        *v = int(json[name].(float64))
                    }
                }
            }
            consts.Refresh()
            res["result"] = "ok"
        }
    }
    return res
}

func (g *Game) getConstants() consts.JsonType {
    res := utils.JsonAction("getConst", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        fmt.Println(consts.VELOCITY)
        for name, val := range consts.NameConstMapping {
            res[name] = val
        }
        fmt.Println(consts.VELOCITY)
        res["result"] = "ok"
    }
    return res
}

func (g *Game) setCharacteristicsToActiveObject(obj gameObjectsBase.Activer, characteristics map[string] interface{}) {
    for c, v := range consts.CharacteristicDefaultValueMapping {
        if characteristics[consts.CharacteristicNameMapping[c]] == nil {
            obj.SetCharacteristic(c, v)
        } else {
            obj.SetCharacteristic(c, int(characteristics[consts.CharacteristicNameMapping[c]].(float64)))
        }
    }
}

func (g *Game) putMob(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("putMob", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        var requiredFields = map[string] string {
            "x" : "badPlacing",
            "y" : "badPlacing",
            "flags" : "badFlag",
            "race" : "badRace",
            "dealtDamage" : "badDamage",
        }
        var ok bool
        if ok, res["result"] = utils.CheckJsonRequest(json, requiredFields); ok {
            damage := json["dealtDamage"].(string)
            if utils.IsDiceDesc(damage) {
                flags := json["flags"].([] interface{})
                var stats = map[string] interface{} {}
                if json["stats"] != nil {
                    stats = json["stats"].(map[string] interface{})
                }
                pt, isGoodPoint := utils.GetPointFromJson(json)
                race, isExistRace := consts.NameRaceMapping[json["race"].(string)]
                if !(isGoodPoint && g.field.FreeForObject(pt.X, pt.Y)) {
                    res["result"] = "badPlacing"
                } else if !gameObjectsFlags.CheckFlags(flags) {
                    res["result"] = "badFlag"
                } else if !isExistRace {
                    res["result"] = "badRace"
                } else {
                    m := gameObjects.NewTestMob(pt.X, pt.Y, race, damage, flags)
                    g.setCharacteristicsToActiveObject(m, stats)
                    res["id"] = g.mobs.registerMob(m)
                    res["result"] = "ok"
                }
            } else {
                res["result"] = "badDamage"
            }
        }
    }
    return res
}

func (g *Game) putPlayer(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("putPlayer", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        var requiredFields = map[string] string {
            "x" : "badPlacing",
            "y" : "badPlacing",
            //"inventory" : "badInventory",
        }
        var ok bool
        if ok, res["result"] = utils.CheckJsonRequest(json, requiredFields); ok {
            inventory, ok := json["inventory"].([] interface{})
            var stats = map[string] interface{} {}
            if json["stats"] != nil {
                stats = json["stats"].(map[string] interface{})
            }
            pt, isGoodPoint := utils.GetPointFromJson(json)
            if !(isGoodPoint && g.field.FreeForObject(pt.X, pt.Y)) {
                res["result"] = "badPlacing"
            } else {
                p := gameObjects.NewPlayer(utils.GenerateId(), -1, "", utils.GenerateSID(), pt.X, pt.Y)
                g.setCharacteristicsToActiveObject(p, stats)
                g.players.add(p)
                g.field.LinkToCells(p)
                if ok {
                    var idxs []int64
                    for _, itemDesc := range inventory {
                        item := gameObjectsBase.ItemFromJson(consts.JsonType(itemDesc.(map[string] interface{})))
                        if item != nil {
                            g.items.addItem(item)
                            p.AddItem(item)
                            idxs = append(idxs, item.GetID())
                        }
                    }
                    res["inventory"] = idxs
                }
                var idxs []int64
                if slots, okey := json["slots"].(map[string] interface{}); okey {
                    fmt.Println(slots)
                    for slotName, itemDesc := range slots {
                        item := gameObjectsBase.ItemFromJson(consts.JsonType(itemDesc.(map[string] interface{})))
                        if item != nil {
                            p.AddItem(item)
                            isEquip, _ := p.Equip(item, consts.NameSlotMapping[slotName])
                            if isEquip {
                                g.items.addItem(item)
                                idxs = append(idxs, item.GetID())
                            }
                        }
                    }
                    res["slots"] = idxs
                }
                res["sid"] = p.SID
                res["id"] = p.GetID()
                res["fistId"] = p.GetFistID()
                res["result"] = "ok"
            }
        }
    }
    return res
}

func (g *Game) putItem(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("putItem", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        var requiredFields = map[string] string {
            "x" : "badPlacing",
            "y" : "badPlacing",
            "item" : "badItem",
        }
        var ok bool
        if ok, _ = utils.CheckJsonRequest(json, requiredFields); ok {
            itemDesc, ok1 := json["item"].(map[string] interface{})
            pt, isGoodPoint := utils.GetPointFromJson(json)
            if isGoodPoint && !g.field.IsBlocked(int(pt.X), int(pt.Y)) {
                res["result"] = "badInventory"
                if ok1 {
                    item := gameObjectsBase.ItemFromJson(itemDesc)
                    if item != nil {
                        item.ForcePlace(*geometry.MakePoint(pt.X, pt.Y))
                        g.items.addItem(item)
                        g.field.LinkToCells(item)
                        res["id"] = item.GetID()
                        res["result"] = "ok"
                    }
                }
            } else {
                res["result"] = "badPlacing"
            }
        }
    }
    return res
}

func (g *Game) enforceAction(json consts.JsonType) consts.JsonType {
    res := utils.JsonAction("enforce", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        enforcedAction, ok := json["enforcedAction"].(map[string] interface{})
        if !ok {
            res["result"] = "badEnforcedAction"
        } else {
            res["result"] = "ok"
            action, ok := enforcedAction["action"].(string)
            if !ok {
                action = ""
            }
            res["actionResult"] = g.doPlayersAction(action, enforcedAction)
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
        consts.TEST_MODE = true
        res["result"] = "ok"
    }
    return res
}

func (g *Game) stopTesting(sid string) consts.JsonType {
    res := utils.JsonAction("stopTesting", "badAction")
    if *consts.TEST && consts.TEST_MODE {
        for name, constant := range consts.NameConstMapping {
            if v, ok := constant.(*float64); ok {
                *v = consts.NameDefaultConstMapping[name].(float64)
            } else if v, ok := constant.(*int); ok {
                *v = consts.NameDefaultConstMapping[name].(int)
            } else {
                return res
            }
        }
        consts.TEST_MODE = false
        consts.SetDefaultConstantsValues()
        g.mobs.Clear()
        g.players.Clear(sid)
        g.items.Clear()
        g.field.Clear()
        res["result"] = "ok"
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

func (g *Game) CreatePlayer(sid string) *gameObjects.Player {
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
        item := gameObjectsBase.NewItemByID(iid, p, amount)
        p.RestoreItem(item, place)
        g.items.addItem(item)
    }
    rows, _ = db.Query("SELECT item_id, amount, slot FROM users_slots WHERE user_id = ?", dbId)
    for rows.Next() {
        var (
            iid int64
            amount, slot int
        )
        rows.Scan(&iid, &amount, &slot)
        item := gameObjectsBase.NewItemByID(iid, p, amount)
        p.RestoreSlot(item, slot)
        g.items.addItem(item)
    }
    return p
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
    id, ok := utils.GetIdFromJson(json)
    if ok {
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
    res["health"] = player.GetHP()
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
    conn := g.id2conn[p.GetID()]
    g.CloseConnection(conn)
    if g.field.Initialized() {
        g.field.UnlinkFromCells(p)
    }
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
