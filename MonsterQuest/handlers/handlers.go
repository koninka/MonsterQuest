package handlers

import (
    "fmt"
    "net/http"
    "io/ioutil"
    "encoding/json"
    "database/sql"
    "MonsterQuest/MonsterQuest/connect"
    "github.com/nu7hatch/gouuid"
    "regexp"
)

func isExistUser(login, pass string) bool {
    db := connect.CreateConnect()
    var (
        where string = "login = ?"
        isLogin bool
    )
    if isLogin = pass != ""; isLogin {
        where = where + " AND password = ?"
    }
    stmt, _ := db.Prepare(connect.MakeSelect("users", where, "id"))
    defer connect.CloseDB(db, stmt)
    if isLogin {
        return stmt.QueryRow(login, pass).Scan() != sql.ErrNoRows
    } else {
        return stmt.QueryRow(login).Scan() != sql.ErrNoRows
    }
}

func registerAction(hash map[string] interface{}) string {
    data := make(map[string] string)
    db, _ := sql.Open("mysql", "monster_user:qwerty@/monsterquest")
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
