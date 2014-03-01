package main 

import (
    "net/http"
    "MonsterQuest/MonsterQuest/handlers"
)

func main() {
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    http.Handle("/require/", http.StripPrefix("/require/", http.FileServer(http.Dir("./js"))))
    http.ListenAndServe(":80", nil)
}
