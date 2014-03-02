package handlers

import (
    "fmt"
    "net/http"
    "html/template"
    "io/ioutil"
    "encoding/json"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "regexp"
)

func MainHandler(w http.ResponseWriter, r *http.Request) {
     t, _ := template.ParseFiles("index.html")
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
    
    appropriateLogin, _ := regexp.MatchString("^([a-z]|[A-Z]|[0-9]){2,36}$", hash["login"].(string))
    appropriatePassword, _ := regexp.MatchString("^.{6,36}$", hash["password"].(string))
    
    if rows.Next() {
        data["result"] = "loginExists"
    } else if !appropriateLogin {
        data["result"] = "badLogin"
    } else if !appropriatePassword {  
        data["result"] = "badPassword"
    } else {
        db.Query("insert into users(login, password) values(?, ?)", hash["login"], hash["password"])
        data["result"] = "ok"
    }  
    
    res, _ := json.Marshal(data)
    return string(res)
}

func JsonHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-type", "application/json")
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
