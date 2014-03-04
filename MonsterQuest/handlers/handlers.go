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

func loginAction(login, pass string) string {
    result := map[string] string{"result": "invalidCredentials"}
    fmt.Println(32)
    if isExistUser(login, pass) {
        db := connect.CreateConnect()
        u4, _ := uuid.NewV4()
        stmt, _ := db.Prepare("CALL add_session(?, ?)")
        defer connect.CloseDB(db, stmt)
        _, err := stmt.Exec(login, u4)
        if err == nil {
            fmt.Println(u4.String())
            result["sid"] = u4.String()
            result["result"] = "ok";
        }
    }
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

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
