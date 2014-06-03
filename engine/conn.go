
package engine

import (
    "github.com/gorilla/websocket"
    "log"
    "net/http"
    "MonsterQuest/consts"
)

const MAX_MESSAGE_BAG_SIZE = 300

type connection struct {
    ws            *websocket.Conn
    send          chan consts.JsonType
    notifications []consts.JsonType
}

func (c *connection) AddNotification(n consts.JsonType) {
    c.notifications = append(c.notifications, n)
}

func (c *connection) ClearNotifications() {
    c.notifications = make([] consts.JsonType, 0, MAX_MESSAGE_BAG_SIZE)
}

func (c *connection) readPump() {
    defer func() {
        GetInstance().unregister <- c
        c.ws.Close()
    }()
    for {
        var json consts.JsonType
        err := c.ws.ReadJSON(&json)
        if err != nil {
            break
        }
        sid, present := json["sid"].(string)
        
        if present && GetInstance().IsSIDValid(sid) {
            GetInstance().CheckOutPlayersAction(c, json)
        } else if action, present := json["action"]; present {
            badSidResponse := consts.JsonType {"result" : "badSid", "action" : action.(string)}
            c.send <- badSidResponse
        } else {
            badActionResponse := consts.JsonType {"result" : "badAction", "action" : ""}
            c.send <- badActionResponse
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
                GetInstance().CloseConnection(c)
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
    c := &connection{send: make(chan consts.JsonType), ws: ws, notifications: make([] consts.JsonType, 0, MAX_MESSAGE_BAG_SIZE)}
    c := &connection{send: make(chan interface{}), ws: ws, notifications: make([]consts.JsonType, 300)}
    GetInstance().AddConnection(c)
}