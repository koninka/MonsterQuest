package engine

import (
	"MonsterQuest/consts"
)

type websocketHub struct {
	connections map[*connection] bool

	broadcast chan consts.JsonType

	register chan *connection

	unregister chan *connection
    ticks      chan int64
}

func (h *websocketHub) run() {
	for {
		select {
		case c := <-h.register:
			h.connections[c] = true
		case c := <-h.unregister:
			delete(h.connections, c)
		case m := <-h.broadcast:
			for c := range h.connections {
				c.send <- m
			}
        case t := <-h.ticks:
            v := make(consts.JsonType)
            v["tick"] = t

            for c := range h.connections {
                n := c.notifications
                v["events"] = n
                c.send <- v
                c.ClearNotifications()
            }
        }
    }
}
