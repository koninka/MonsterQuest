package auth

import (
    "fmt"
    "os"
    "net/http"
    "io/ioutil"
    "encoding/json"
    "database/sql"
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "MonsterQuest/engine"
    "MonsterQuest/utils"
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
    defer stmt.Close()
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
    defer stmt.Close()
    res, _ := stmt.Exec(u4)
    if amount, _ := res.RowsAffected(); amount != 1 {
        result["result"] = "badSid"
    } else {
        engine.GetInstance().LogoutPlayer(u4)
    }
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

func loginAction(login, pass string) string {
    result := map[string] interface{} {"result": "invalidCredentials"}
    if isExistUser(login, pass) {
        db := connect.CreateConnect()
        sid := utils.GenerateSID()
        stmt, _ := db.Prepare("CALL add_user_session(?, ?)")
        defer stmt.Close()
        _, err := stmt.Exec(login, sid)
        if err == nil {
            host, _ := os.Hostname()
            result["sid"] = sid
            result["result"] = "ok"
            result["webSocket"] = "ws://" + host + consts.SERVER_PORT + "/websocket"
            p := engine.GetInstance().CreatePlayer(sid)
            result["id"] = p.GetID()
            result["fistId"] = p.GetFistID()
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
            defer stmt.Close()
            res, _ := stmt.Exec(login, pass)
            user_id, _ := res.LastInsertId()
            stmt, _ = db.Prepare("INSERT INTO users_position(user_id, x, y) VALUES(?, ?, ?)")
            defer stmt.Close()
            stmt.Exec(user_id, consts.DEFAULT_PLAYER_POS_X, consts.DEFAULT_PLAYER_POS_Y)
        }
    }
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

func JsonHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Content-type", "application/json")
    body, _ := ioutil.ReadAll(r.Body)
    var rawData interface{}
    json.Unmarshal(body, &rawData)
    data := rawData.(map[string] interface{})
    var response string
    fmt.Println("http json handler", data)
    if data["action"] == "logout" {
        response = logoutAction(data["sid"].(string))
    } else {
        if data["action"] == "startTesting" {
            r, _ := json.Marshal(map[string] string{"result": "ok"})
            response = string(r)
        } else {
            login, pass := data["login"].(string), data["password"].(string)
            switch data["action"] {
                case "login":    response = loginAction(login, pass)
                case "register": response = registerAction(login, pass)
            }
        }

    }
    fmt.Fprintf(w, "%s", response)
}