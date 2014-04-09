package main

import (
    "fmt"
    "MonsterQuest/engine"
    "MonsterQuest/auth"
    "MonsterQuest/consts"
    "net/http"
    "html/template"
)

func makeHandler(name string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        template.Must(template.ParseFiles(fmt.Sprintf("web/pages/%s.html", name))).Execute(w, nil)
    }
}

func main() {
    consts.ParseCommandLine()
    http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./web/js"))))
    http.Handle("/style/", http.FileServer(http.Dir("./web/")))
    http.Handle("/imgs/", http.StripPrefix("/imgs/", http.FileServer(http.Dir("./resourses/imgs/"))))
    http.HandleFunc("/websocket", engine.ServeWs)
    http.HandleFunc("/", makeHandler("main"))
    http.Handle("/game/", makeHandler("game"))
    http.HandleFunc("/json", auth.JsonHandler)
    if(*consts.TEST) {
        http.HandleFunc("/tests/", makeHandler("tests"))
    }
    go engine.GameLoop()
    http.ListenAndServe(consts.SERVER_PORT, nil)
}