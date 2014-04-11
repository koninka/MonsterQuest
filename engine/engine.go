package engine

import (
    "database/sql"
    "time"
    "math"
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjects"
    "MonsterQuest/geometry"
)

type jsonType map[string] interface{}

type Game struct {
    websocketHub
    field gameField
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

func getGameField() *gameField {
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
            gameField{
                field: make([]string, 1000),
                actors: make([][]map[int64] gameObjects.Activer, 1000),
            },
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
        for i := range gameInstance.field.field {
            gameInstance.field.actors[i] = make([]map[int64] gameObjects.Activer, 1000)
            for j := range gameInstance.field.actors[i] {
                gameInstance.field.actors[i][j] = make(map[int64] gameObjects.Activer)
            }
        }
        gameInstance.mobs.initializeMobTypes()
        gameInstance.field.loadFromFile("map.txt", "areas.txt", &gameInstance.mobs)
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
    case "getDictionary": conn.send <- g.getDictionaryAction()
    case "look": conn.send <- g.lookAction(json["sid"].(string))
    case "examine": conn.send <- g.examineAction(json)
    case "move": g.lastActions[json["sid"].(string)] = json
    case "startTesting" : conn.send <- g.startTesting()
    case "endTesting"   : conn.send <- g.endTesting()
    case "setUpMap" : conn.send <- g.setUpMap(json)
    default: conn.send <- g.badAction(action)
    }
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

        if !g.field.loadFromStrings(mapStrs) {
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

func (g *Game) linkActorToCells(obj gameObjects.Activer) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    id := obj.GetID()
    g.field.actors[ltr][ltc][id] = obj
    g.field.actors[ltr][rbc][id] = obj
    g.field.actors[rbr][rbc][id] = obj
    g.field.actors[rbr][ltc][id] = obj
}

func (g *Game) unlinkActorFromCells(obj gameObjects.Activer) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    id := obj.GetID()
    delete(g.field.actors[ltr][ltc], id)
    delete(g.field.actors[ltr][rbc], id)
    delete(g.field.actors[rbr][rbc], id)
    delete(g.field.actors[rbr][ltc], id)
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

func (g *Game) getObjectById(id int64) (gameObjects.Activer, bool) {
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
    l, r, scol := g.getVisibleSpace(int(player.Center.X), g.field.width - 1)
    t, b, srow := g.getVisibleSpace(int(player.Center.Y), g.field.height - 1)
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            visibleSpace[i - t + srow][j - l + scol] = string(g.field.field[i][j])
        }
    }
    res["map"] = visibleSpace
    visibleActors := make([]jsonType, 0, 1000)
    var addedActors = map[int64] bool {player.GetID() : true}
    for i := t; i < b; i++ {
        for j := l; j < r; j++ {
            for id, obj := range g.field.actors[i][j] {
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

func (g *Game) checkCollisionWithWalls(obj gameObjects.Activer, dir int) (bool, geometry.Point) {
    pos := obj.GetShiftedFrontSide(dir)
    if g.field.isBlocked(int(pos.X), int(pos.Y)) {
        switch dir {
        case consts.NORTH_DIR: 
            pos.Y = math.Ceil(pos.Y) + consts.OBJECT_HALF
        case consts.SOUTH_DIR:
            pos.Y = math.Floor(pos.Y) - consts.OBJECT_HALF
        case consts.EAST_DIR:
            pos.X = math.Floor(pos.X) - consts.OBJECT_HALF
        case consts.WEST_DIR:
            pos.X = math.Ceil(pos.X) + consts.OBJECT_HALF
        }
        return false, pos
    }
    eps := 2.0
    side, pos := obj.GetCollisionableSide(dir)
    res1 := g.field.isBlocked(int(side.Point1.X), int(side.Point1.Y))
    res2 := g.field.isBlocked(int(side.Point2.X), int(side.Point2.Y))
    var near float64
    if res1 || res2 {
        switch dir {
        case consts.NORTH_DIR, consts.SOUTH_DIR:
            if res1 {
                near = math.Ceil(side.Point1.X) - side.Point1.X
            } else {
                near = math.Floor(side.Point1.X) - side.Point1.X
            }
            if math.Abs(near) < eps {
                side.Point1.X = side.Point1.X + near
                side.Point2.X = side.Point2.X + near
            } else {
                return false, obj.GetCenter()
            }
            pos.X = (side.Point1.X + side.Point2.X) / 2
        case consts.EAST_DIR, consts.WEST_DIR:
            if res1 {
                near = math.Ceil(side.Point1.Y) - side.Point1.Y
            } else {
                near = math.Floor(side.Point1.Y) - side.Point1.Y
            }
            if math.Abs(near) < eps {
                side.Point1.Y = side.Point1.Y + near
                side.Point2.Y = side.Point2.Y + near
            } else {
                return false, obj.GetCenter()
            }
            pos.Y = (side.Point1.Y + side.Point2.Y) / 2
        }
    }
    return true, pos 
}

func (g *Game) checkCollisionWithActorsInCell(col, row int, segment *geometry.Segment) bool {
    res := false
    for _, actor := range g.field.actors[row][col] {
        r := actor.GetRectangle()
        res = res || r.CrossedBySegment(segment)
    }
    return res
}

func (g *Game) checkCollisionWithActors(obj gameObjects.Activer, dir int) (bool, geometry.Point) {
    segment, pos := obj.GetCollisionableSide(dir)
    col1, row1 := int(segment.Point1.X), int(segment.Point1.Y)
    col2, row2 := int(segment.Point2.X), int(segment.Point2.Y)
    res := g.checkCollisionWithActorsInCell(col1, row1, &segment) || g.checkCollisionWithActorsInCell(col2, row2, &segment)
    if res {
        pos = obj.GetCenter()
    }
    return res, pos
}

func (g *Game) calcNewCenterForActor(obj gameObjects.Activer, dir int) (bool, geometry.Point) {
    collisionOccured := false
    noCollisionWithWall, res := g.checkCollisionWithWalls(obj, dir)
    if noCollisionWithWall {
        collisionWithActorOccured, alternativeRes := g.checkCollisionWithActors(obj, dir)
        if collisionWithActorOccured {
            res = alternativeRes
            collisionOccured = true
        }
    } else {
        collisionOccured = true
    }
    return collisionOccured, res
}

func (g *Game) moveActor(obj gameObjects.Activer, dir int) bool {
    if dir == -1 {
        return false
    }
    collisionOccured, newCenter := g.calcNewCenterForActor(obj, dir)
    g.unlinkActorFromCells(obj)
    obj.ForcePlace(newCenter)
    g.linkActorToCells(obj)
    return collisionOccured
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
    for k, v := range g.lastActions {
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
    }
}

func (g *Game) IsSIDValid(sid string) bool {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(connect.MakeSelect("sessions", "sid = ?", "id"))
    defer stmt.Close()
    return stmt.QueryRow(sid).Scan() != sql.ErrNoRows
}

func (g *Game) LogoutPlayer(sid string) {
    g.unlinkActorFromCells(g.players.getPlayerBySession(sid))
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
