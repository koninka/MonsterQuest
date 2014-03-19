package engine

import (
    "database/sql"
    "time"
    "MonsterQuest/MonsterQuest/connect"
    "MonsterQuest/MonsterQuest/consts"
    "fmt"
)

type jsonType map[string] interface{}

type Game struct {
    websocketHub
    field gameField
    players playerList
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
            },
			playerList{
                make(map[int64] *player),
                make(map[string] *player),
            },
            make(map[string] jsonType),
        }
        gameInstance.field.loadFromFile("map.txt")
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
        setSuccesResult(info.login, info.x, info.y)
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
                g.players.add(json["sid"].(string), login, x, y, id)
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
    l, r := g.getVisibleSpace(int(player.x), g.field.width - 1)
    t, b := g.getVisibleSpace(int(player.y), g.field.height - 1)
    visibleSpace := make([][]string, b - t + 1)
    for i := t; i <= b; i++ {
        visibleSpace[i - t] = make([]string, r - l + 1)
        for j := l; j <= r; j++ {
            visibleSpace[i - t][j - l] = string(g.field.field[i][j])
        }
    }
    res["map"] = visibleSpace
    visiblePlayers := make([]jsonType, 0, 1000)
    requester := g.players.getPlayerBySession(sid)
    for id, p := range g.players.players {
        if p.x > float64(l) && p.x < float64(r) && p.y > float64(t) && p.y < float64(b) && p != requester {
            json := make(jsonType)
            json["type"] = "player"
            json["id"] = id
            json["x"] = p.x
            json["y"] = p.y
            visiblePlayers = append(visiblePlayers, json)
        }
    }
    res["actors"] = visiblePlayers
	res["x"] = player.x
	res["y"] = player.y
    return res
}

func (g *Game) updateWorld() {
    for k, v := range g.lastActions {
        action := v["action"].(string)
        dir := v["direction"].(string)
        p := g.players.sessions[k]
        if action == "move" {
            dcol, drow := getShiftByDirection(dir)
            col := int(p.x) / consts.TILE_SIZE + dcol
            row := int(p.y) / consts.TILE_SIZE + drow
            if !g.field.isBlocked(col, row) {
                p.move(dir)
            } else {
                side := p.getCollisionableSide(dir)
                wall := g.field.getTileRectangle(col, row)
				fmt.Println(col, row)
                fmt.Println(side)
                fmt.Println(wall)
                fmt.Println(wall.CrossedBySegment(&side))
                if !wall.CrossedBySegment(&side) {
                    p.move(dir)
                }
            }
        }
        delete(g.lastActions, k)
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
