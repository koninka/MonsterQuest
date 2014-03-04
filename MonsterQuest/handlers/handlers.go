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
    "html/template"
    "code.google.com/p/go.net/websocket"
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

func matchRegexp(pattern, str string) bool {
    result, _ := regexp.MatchString(pattern, str)
    return result
}

func logoutAction(u4 string) string {
    result := map[string] string{"result": "ok"}
    db := connect.CreateConnect()
    stmt, _ := db.Prepare("DELETE FROM sessions WHERE sid = ?")
    defer connect.CloseDB(db, stmt)
    res, _ := stmt.Exec(u4)
    if amount, _ := res.RowsAffected(); amount != 1 {
        result["result"] = "badSid"
    }
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

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

func registerAction(login, pass string) string {
    result := map[string] string{"result": "ok"}
    if isExistUser(login, "") {
        result["result"] = "loginExists"
    } else {
        if !matchRegexp("^[a-zA-Z0-9]{2,36}$", login) {
            result["result"] = "badLogin"
        } else if !matchRegexp("^.{6,36}$", pass) {
            result["result"] = "badPassword"
        } else {
            db := connect.CreateConnect()
            stmt, _ := db.Prepare("INSERT INTO users(login, password) VALUES(?, ?)")
            res, _ := stmt.Exec(login, pass)
            lastId, _ := res.LastInsertId()
            fmt.Printf("last insert id = %d\n", lastId)
        }
    }
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

func JsonHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-type", "application/json")
    body, _ := ioutil.ReadAll(r.Body)
    var rawData interface{}
    json.Unmarshal(body, &rawData)
    data := rawData.(map[string] string)
    login, pass := data["login"], data["password"]
    var response string
    switch data["action"] {
        case "login":    response = loginAction(login, pass)
        case "logout":   response = logoutAction(data["sid"])
        case "register": response = registerAction(login, pass)
    }
    fmt.Fprintf(w, "%s", response)
}


func MainHandler(w http.ResponseWriter, r *http.Request) {
    t, _ := template.ParseFiles("index.html")
    t.Execute(w, nil)
}

func Echo(ws *websocket.Conn) {
    var err error
    for {
        var reply map[string] string

        if err = websocket.JSON.Receive(ws, &reply); err != nil {
            fmt.Println("Can't receive")
            fmt.Println(err)
            break
        }
        fmt.Println(reply)

        msg := reply
        msg["result"] = "ok"
        fmt.Println(msg)

        if err = websocket.JSON.Send(ws, msg); err != nil {
            fmt.Println("Can't send")
            fmt.Println(err)
            break
        }
    }
}