package engine

import (
    "database/sql"
    "time"
    "MonsterQuest/MonsterQuest/connect"
    "MonsterQuest/MonsterQuest/consts"
    "MonsterQuest/MonsterQuest/gameObjects"
    "MonsterQuest/MonsterQuest/geometry"
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
                actors: make([][]map[int64]bool, 1000),
            },
			playerList{
                make(map[int64] *gameObjects.Player),
                make(map[string] *gameObjects.Player),
            },
            mobList{
                make(map[int64] *gameObjects.Mob),
            },
            make(map[string] jsonType),
        }
        for i := range gameInstance.field.field {
            gameInstance.field.actors[i] = make([]map[int64]bool, 1000)
            for j := range gameInstance.field.actors[i] {
                gameInstance.field.actors[i][j] = make(map[int64]bool)
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
    g.field.actors[ltr][ltc][id] = true
    g.field.actors[ltr][rbc][id] = true
    g.field.actors[rbr][rbc][id] = true
    g.field.actors[rbr][ltc][id] = true
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
            SELECT u.login
            FROM users u
            INNER JOIN sessions s ON s.user_id = u.id AND s.sid = ?
        `)
        defer stmt.Close()
        var login string
        err := stmt.QueryRow(sid).Scan(&login)
        if err != sql.ErrNoRows {
            stmt, _ := db.Prepare("SELECT X, Y FROM users_position WHERE id = ?")
            var x, y float64
            err = stmt.QueryRow(id).Scan(&x, &y)
            if err != sql.ErrNoRows {
                setSuccesResult(login, x, y)
                p := g.players.add(json["sid"].(string), login, x, y, id)
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

func (g *Game) getVisibleSpace(coord, bound int) (v1 int, v2 int) {
    if coord - consts.VISION_RADIUS < 0 {
        v1 = 0
    } else {
        v1 = coord - consts.VISION_RADIUS
    }
    if coord + consts.VISION_RADIUS > bound {
        v2 = bound
    } else {
        v2 = coord + consts.VISION_RADIUS
    }
    return
}

func (g *Game) lookAction(sid string) jsonType {
    res := make(jsonType)
    res["action"] = "look"
    player := g.players.getPlayerBySession(sid)
    l, r := g.getVisibleSpace(int(player.Center.X), g.field.width - 1)
    t, b := g.getVisibleSpace(int(player.Center.Y), g.field.height - 1)
    visibleSpace := make([][]string, b - t)
    for i := t; i < b; i++ {
        visibleSpace[i - t] = make([]string, r - l)
        for j := l; j < r; j++ {
            visibleSpace[i - t][j - l] = string(g.field.field[i][j])
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
        if area.In(&m.Center) {
            json := make(jsonType)
            json["type"] = "mob"
            json["id"] = id
            json["x"] = m.Center.X
            json["y"] = m.Center.Y
            visibleActors = append(visibleActors, json)
        }
    }
    res["actors"] = visibleActors
	res["x"] = player.Center.X
	res["y"] = player.Center.Y
    return res
}

func (g *Game) checkCollisionWithWalls(p *gameObjects.Player, dir string) bool {
    segment := p.GetCollisionableSide(dir)
    col1, row1 := int(segment.Point1.X), int(segment.Point1.Y)
    col2, row2 := int(segment.Point2.X), int(segment.Point2.Y)
    return !g.field.isBlocked(col1, row1) && !g.field.isBlocked(col2, row2)   
}

func (g *Game) checkCollisionWithPlayers(p *gameObjects.Player, dir string) bool {
    res := true
    segment := p.GetCollisionableSide(dir)
    col1, row1 := int(segment.Point1.X), int(segment.Point1.Y)
    col2, row2 := int(segment.Point2.X), int(segment.Point2.Y)
    id := p.GetID()
    for k, _ := range g.field.actors[row1][col1] {
        if (k != id) {
            r := g.players.getPlayerById(k).GetRectangle()
            res = res && r.CrossedBySegment(&segment)
        }
    }
    for k, _ := range g.field.actors[row2][col2] {
        if (k != id) {
            r := g.players.getPlayerById(k).GetRectangle()
            res = res && r.CrossedBySegment(&segment)
        }
    }
    return res
}

func (g *Game) updateWorld() {
    for k, v := range g.lastActions {
        action := v["action"].(string)
        dir := v["direction"].(string)
        p := g.players.getPlayerBySession(k)
        if action == "move" {
            if g.checkCollisionWithWalls(p, dir) && g.checkCollisionWithPlayers(p, dir) {
                g.unlinkActorFromCells(p)
                p.Move(dir)
                g.linkActorToCells(p)
            } 
        }
        delete(g.lastActions, k)
    }
    for _, v := range g.mobs.mobs {
        v.Do()
    }
}

func (g *Game) IsSIDValid(sid string) bool {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(connect.MakeSelect("sessions", "sid = ?", "id"))
    defer stmt.Close()
    return stmt.QueryRow(sid).Scan() != sql.ErrNoRows
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
