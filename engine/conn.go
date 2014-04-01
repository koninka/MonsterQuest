
package engine

import (
    "github.com/gorilla/websocket"
    "log"
    "net/http"
)

type connection struct {
    ws *websocket.Conn
    send chan interface{}
}

func (c *connection) readPump() {
    defer func() {
        GetInstance().unregister <- c
        c.ws.Close()
    }()
    for {
        var json map[string] interface{}
        err := c.ws.ReadJSON(&json)
        if err != nil {
            break
        }
        if GetInstance().IsSIDValid(json["sid"].(string)) {
            GetInstance().CheckOutPlayersAction(c, json)
        } else {
            badSidResponse := map[string] string {"result" : "badSid", "action" : json["action"].(string)}
            c.send <- badSidResponse
        }
    }
}

func (c *connection) write(mt int, payload []byte) error {
    return c.ws.WriteMessage(mt, payload)
}

func (c *connection) writePump() {
    defer c.ws.Close()
    for {
        select {
        case message := <-c.send:
            if err := c.ws.WriteJSON(message); err != nil {
                return
            }
        }
    }
}

func ServeWs(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "Method not allowed", 405)
        return
    }
    ws, err := websocket.Upgrade(w, r, nil, 1024, 1024)
    if _, ok := err.(websocket.HandshakeError); ok {
        http.Error(w, "Not a websocket handshake", 400)
        return
    } else if err != nil {
        log.Println(err)
        return
    }
    c := &connection{send: make(chan interface{}), ws: ws}
    GetInstance().AddConnection(c)
}