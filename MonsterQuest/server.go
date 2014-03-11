package main

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
    "MonsterQuest/MonsterQuest/engine"
)

func main() {
    http.Handle("/require/", http.StripPrefix("/require/", http.FileServer(http.Dir("./js"))))
    http.Handle("/style/",   http.FileServer(http.Dir("./")))
    http.Handle("/game/",   http.FileServer(http.Dir("./")))
    http.Handle("/tests/",   http.FileServer(http.Dir("./")))
    http.Handle("/wsTest/",   http.FileServer(http.Dir("./")))
    http.HandleFunc("/websocket", engine.ServeWs)
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    go engine.GameLoop()
    http.ListenAndServe(handlers.Port, nil)
}