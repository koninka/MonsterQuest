package main 

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
    "code.google.com/p/go.net/websocket"
)

func main() {
    http.Handle("/require/", http.StripPrefix("/require/", http.FileServer(http.Dir("./js"))))
    http.Handle("/style/",   http.FileServer(http.Dir("./")))
    http.Handle("/tests/",   http.FileServer(http.Dir("./")))
    http.Handle("/wsTest/",   http.FileServer(http.Dir("./")))
    http.Handle("/websocket", websocket.Handler(handlers.Echo))
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    http.ListenAndServe(":80", nil)
}
