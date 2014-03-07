package engine

import (
    "time"
)

type jsonType map[string] interface{} 

type Game struct {
    websocketHub
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
                connections: make(map[*connection]bool),
            },
            make(map[string] jsonType),
        }
        go gameInstance.websocketHub.run()
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
    case "look": 
    case "examine":
    case "move":
        g.lastActions[json["sid"].(string)] = json
    }
}

func (g *Game) getDictionaryAction() jsonType {
    res := make(jsonType)
    res["result"] = "ok"
    res["."] = "grass"
    res["#"] = "wall"
    return res
}

func (g *Game) changeWorldWithPlayer(json jsonType) {
    action := json["action"].(string)
    switch action {
        case "move": // change player's coords
    }
}

func (g *Game) IsSIDValid(sid string) bool {
    return true 
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
        time.Sleep(100 * time.Millisecond)
    }


}
