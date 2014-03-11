package engine

import (
    "database/sql"
    "time"
    "MonsterQuest/MonsterQuest/connect"
)

type jsonType map[string] interface{}

type Game struct {
    websocketHub
    sync synchronizer
    lastActions map[string] jsonType
}

const (
    OFFSET = 0.2
    DEFAULT_PLAYER_POS_X = 5
    DEFAULT_PLAYER_POS_Y = 5
)

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
            synchronizer{
                make(map[int64] *player),
                make(map[string] *player),
            },
            make(map[string] jsonType),
        }
        go gameInstance.websocketHub.run()
        go gameInstance.sync.save()
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
    case "look": conn.send <- g.lookAction()
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
    res["result"] = "ok"
    res["action"] = "examine"
    if (g.sync.isExists(id)) {
        res["type"] = "player"
        res["id"] = id
        res["login"], res["x"], res["y"] = g.sync.getPlayerInfo(id)
    } else {
        db := connect.CreateConnect()
        stmt, _ := db.Prepare(`
            SELECT
               u.id,
               u.login,
               IFNULL((SELECT up.X FROM users_position up WHERE up.user_id = s.user_id), -1) as pos_x,
               IFNULL((SELECT up.Y FROM users_position up WHERE up.user_id = s.user_id), -1) as pos_y
            FROM users u
            INNER JOIN sessions s ON s.user_id = u.id AND s.sid = ?
        `)
        defer connect.CloseDB(db, stmt)
        var (
            x, y float64
            login string
            user_id int
        )
        _ = stmt.QueryRow(sid).Scan(&user_id, &login, &x, &y)
        res["type"] = "player"
        res["login"] = login
        res["id"] = id
        if x == -1 || y == -1 {
            stmt, _ := db.Prepare("INSERT INTO users_position(user_id, x, y) VALUES(?, ?, ?)")
            defer stmt.Close()
            x, y = DEFAULT_PLAYER_POS_X, DEFAULT_PLAYER_POS_Y
            _, _ = stmt.Exec(user_id, x, y)
        }
        res["x"] = x
        res["y"] = y
        g.sync.add(json["sid"].(string), login, x, y, id)
    }
    return res
}

func (g *Game) lookAction() jsonType {
    return nil
}

func (g *Game) changeWorldWithPlayer(json jsonType) {
    action := json["action"].(string)
    switch action {
        case "move":
            g.sync.getPlayerBySession(json["sid"].(string)).move(json["direction"].(string))
    }
}

func (g *Game) IsSIDValid(sid string) bool {
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(connect.MakeSelect("sessions", "sid = ?", "id"))
    defer connect.CloseDB(db, stmt)
    return stmt.QueryRow(sid).Scan() != sql.ErrNoRows
}

func GameLoop() {
    gameInstance = GetInstance()
    var tick int64
    for {
        tick++
        for k, v := range gameInstance.lastActions {
            gameInstance.changeWorldWithPlayer(v)
            delete(gameInstance.lastActions, k)
        }
        gameInstance.sendTick(tick)
        time.Sleep(tickDuration)
    }
}
