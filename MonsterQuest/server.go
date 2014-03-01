package main 

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
)

func main() {
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    http.HandleFunc("/require/", handlers.RequireHandler)
    http.ListenAndServe(":80", nil)
}
