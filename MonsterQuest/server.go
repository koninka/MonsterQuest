package main

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
    //"code.google.com/p/go.net/websocket"
)

func main() {
    go h.run()
    http.Handle("/require/", http.StripPrefix("/require/", http.FileServer(http.Dir("./js"))))
    http.Handle("/style/",   http.FileServer(http.Dir("./")))
    http.Handle("/game/",   http.FileServer(http.Dir("./")))
    http.Handle("/tests/",   http.FileServer(http.Dir("./")))
    http.Handle("/wsTest/",   http.FileServer(http.Dir("./")))
    http.HandleFunc("/websocket", serveWs)
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    http.ListenAndServe(":8080", nil)
}
