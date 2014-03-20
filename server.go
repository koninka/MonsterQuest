package main

import (
    "MonsterQuest/MonsterQuest/engine"
    "MonsterQuest/MonsterQuest/handlers"
    "net/http"
    "os"
)

func main() {
    var test = len(os.Args) > 1 && os.Args[1] == "test";
    http.Handle("/require/", http.StripPrefix("/require/", http.FileServer(http.Dir("./js"))))
    http.Handle("/style/", http.FileServer(http.Dir("./")))
    http.Handle("/img/", http.FileServer(http.Dir("./")))
    http.Handle("/game/", http.FileServer(http.Dir("./")))
    http.Handle("/resourses/", http.FileServer(http.Dir("./")))
    http.HandleFunc("/websocket", engine.ServeWs)
    http.HandleFunc("/", handlers.MainHandler)
    http.HandleFunc("/json", handlers.JsonHandler)
    if(test){
        http.Handle("/tests/", http.FileServer(http.Dir("./")))
	    http.Handle("/wsTest/", http.FileServer(http.Dir("./")))
    }
    go engine.GameLoop()
    http.ListenAndServe(handlers.Port, nil)
}

