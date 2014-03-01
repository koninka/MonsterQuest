package main 

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
)

func main() {
    http.Handle("/", http.FileServer(http.Dir("./")))
    http.HandleFunc("/json", handlers.JsonHandler)
    http.ListenAndServe(":80", nil)
}
