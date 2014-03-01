package handlers

import (
    "fmt"
    "net/http"
    "html/template"
    "io/ioutil"
    "encoding/json"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

const pathToSource = "../src/MonsterQuest/MonsterQuest/"

func MainHandler(w http.ResponseWriter, r *http.Request) {
     t, _ := template.ParseFiles(pathToSource + "index.html")
     t.Execute(w, nil)
}

func loginAction(hash map[string] interface{}) string {
    return "DATA";
}

func registerAction(hash map[string] interface{}) string {
    data := make(map[string] string)
    db, _ := sql.Open("mysql", "root:12345@/monsterquest")
    defer db.Close()
    rows, _ := db.Query("select id from users where login = ?", hash["login"])
    defer rows.Close()
    if rows.Next() {
        data["result"] = "loginExists"
        res, _ := json.Marshal(data)
        return string(res)
    }

    // some checks for goodness of login and password will be here
    
    db.Query("insert into users(login, password) values(?, ?)", hash["login"], hash["password"])
    data["result"] = "ok"
    res, _ := json.Marshal(data)
    return string(res)
}

func JsonHandler(w http.ResponseWriter, r *http.Request) {
    body, _ := ioutil.ReadAll(r.Body)
    var rawData interface{}
    json.Unmarshal(body, &rawData)
    data := rawData.(map[string] interface{})
    var response string
    switch data["action"] {
        case "login": response = loginAction(data)
        case "register": response = registerAction(data)
    }
    fmt.Fprintf(w, "%s", response)
}

func RequireHandler(w http.ResponseWriter, r *http.Request) {
    file, _ := ioutil.ReadFile(pathToSource + r.URL.Path[len("/require/"):])
    fmt.Fprintf(w, "%s", file)    
}
