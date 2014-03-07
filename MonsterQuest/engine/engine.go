package engine

import (
    "time"
)

type Game struct {
    websocketHub
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
}

func (g *Game) CloseConnection(conn *connection) {
    g.unregister <- conn
}

func GameLoop() {

    gameInstance = GetInstance()
    var tick int64  
    for {
        tick++
        
        // process players actions, update world and send tick everyone

        gameInstance.sendTick(tick)
        time.Sleep(100 * time.Millisecond)
    }


}
