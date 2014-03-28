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
            },
            make(map[string] jsonType),
        }
        for i := range gameInstance.field.field {
            gameInstance.field.actors[i] = make([]map[int64] gameObjects.Activer, 1000)
            for j := range gameInstance.field.actors[i] {
                gameInstance.field.actors[i][j] = make(map[int64] gameObjects.Activer)
            }
        }
        gameInstance.field.loadFromFile("map.txt", &gameInstance.mobs)
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
    action := json["action"].(string)
    switch action {
    case "getDictionary": conn.send <- g.getDictionaryAction()
    case "look": conn.send <- g.lookAction(json["sid"].(string))
    case "examine": conn.send <- g.examineAction(json)
    case "move": g.lastActions[json["sid"].(string)] = json
    }
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

func (g *Game) examineAction(json jsonType) jsonType {
    res := make(jsonType)
    id := int64(json["id"].(float64))
    sid := json["sid"].(string)
    res["action"] = "examine"
    setSuccesResult := func (login string, x, y float64) {
        res["x"]      = x
        res["y"]      = y
        res["id"]     = id
        res["type"]   = "player"
        res["login"]  = login
        res["result"] = "ok"
    }
    if info, isExist := g.players.getPlayerInfo(id); isExist {
        setSuccesResult(info.Login, info.Center.X, info.Center.Y)
    } else {
        db := connect.CreateConnect()
        stmt, _ := db.Prepare(`
            SELECT u.id, u.login
            FROM users u
            INNER JOIN sessions s ON s.user_id = u.id AND s.sid = ?
        `)
        defer stmt.Close()
        var (
            login string
            dbId int64
        )
        err := stmt.QueryRow(sid).Scan(&dbId, &login)
        if err != sql.ErrNoRows {
            stmt, _ := db.Prepare("SELECT X, Y FROM users_position WHERE id = ?")
            var x, y float64
            err = stmt.QueryRow(dbId).Scan(&x, &y)
            if err != sql.ErrNoRows {
                setSuccesResult(login, x, y)
                p := g.players.add(json["sid"].(string), login, x, y, id, dbId)
                g.linkActorToCells(p)
            } else {
                res["result"] = "badId"
            }
        } else {
            res["result"] = "badSid"
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
    area := geometry.Rectangle{geometry.Point{float64(l), float64(t)}, geometry.Point{float64(r), float64(b)}}
    for id, p := range g.players.players {
        if area.In(&p.Center) && p != player {
            json := make(jsonType)
            json["type"] = "player"
            json["id"] = id
            json["x"] = p.Center.X
            json["y"] = p.Center.Y
            visibleActors = append(visibleActors, json)
        }
    }
    for id, m := range g.mobs.mobs {
        center := m.GetCenter()
        if area.In(&center) {
            json := make(jsonType)
            json["type"] = "mob"
            json["id"] = id
            json["x"] = center.X
            json["y"] = center.Y
            visibleActors = append(visibleActors, json)
        }
    }
    res["actors"] = visibleActors
	res["x"] = player.Center.X
	res["y"] = player.Center.Y
    return res
}

func (g *Game) checkCollisionWithWalls(obj gameObjects.Activer, dir string) (bool, geometry.Point) {
    pos := obj.GetShiftedFrontSide(dir)
    if g.field.isBlocked(int(pos.X), int(pos.Y)) {
        switch dir {
        case "north": 
            pos.Y = math.Ceil(pos.Y) + consts.OBJECT_HALF
        case "south":
            pos.Y = math.Floor(pos.Y) - consts.OBJECT_HALF
        case "east":
            pos.X = math.Floor(pos.X) - consts.OBJECT_HALF
        case "west":
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
        case "north","south":
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
        case "east", "west":
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

func (g *Game) checkCollisionWithActors(obj gameObjects.Activer, dir string) (bool, geometry.Point) {
    segment, pos := obj.GetCollisionableSide(dir)
    col1, row1 := int(segment.Point1.X), int(segment.Point1.Y)
    col2, row2 := int(segment.Point2.X), int(segment.Point2.Y)
    res := g.checkCollisionWithActorsInCell(col1, row1, &segment) || g.checkCollisionWithActorsInCell(col2, row2, &segment)    
    if res {
        pos = obj.GetCenter()
    }
    return res, pos
}

func (g *Game) calcNewCenterForActor(obj gameObjects.Activer, dir string) (bool, geometry.Point) {
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

func (g *Game) moveActor(obj gameObjects.Activer, dir string) bool {
    if len(dir) == 0 {
        return false
    }
    collisionOccured, newCenter := g.calcNewCenterForActor(obj, dir)
    g.unlinkActorFromCells(obj)
    obj.ForcePlace(newCenter)
    g.linkActorToCells(obj)
    return collisionOccured
}

func (g *Game) updateWorld() {
    for k, v := range g.lastActions {
        action := v["action"].(string)
        p := g.players.getPlayerBySession(k)
        if action == "move" {
            g.moveActor(p, v["direction"].(string))
        }
        delete(g.lastActions, k)
    }
    for _, m := range g.mobs.mobs {
        dir := m.CurrDirection()
        if g.moveActor(m, dir) {
            m.NotifyAboutCollision()
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
