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

func findSIDAndLogOut(login string){
    var sid string
    db := connect.CreateConnect()
    stmt, _ := db.Prepare(`
        SELECT s.sid FROM sessions s
        INNER JOIN users u ON s.user_id = u.id
        WHERE u.login = ?
    `)
    defer stmt.Close()
    err := stmt.QueryRow(login).Scan(&sid)
    if err != sql.ErrNoRows {
        engine.GetInstance().LogoutPlayer(sid)
    }
}

func loginAction(login, pass string) string {
    result := map[string] interface{} {"result": "invalidCredentials"}
    if isExistUser(login, pass) {
        findSIDAndLogOut(login)
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
    if !matchRegexp("^[a-zA-Z0-9]{2,36}$", login) {
        result["result"] = "badLogin"
    } else if !matchRegexp("^.{6,36}$", pass) {
        result["result"] = "badPassword"
    } else if isExistUser(login, "") {
        result["result"] = "loginExists"
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
    resJSON, _ := json.Marshal(result)
    return string(resJSON)
}

func createResponse(action, result string) string {
    r, _ := json.Marshal(map[string] string{"result": result, "action": action})
    return string(r)
}

func JsonHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Content-type", "application/json")
    body, _ := ioutil.ReadAll(r.Body)
    var rawData interface{}
    json.Unmarshal(body, &rawData)
    data := rawData.(map[string] interface{})
    var (
        action string = data["action"].(string)
        response string
    )
    var requiredFields = map[string] string {}
    switch action {
        case "logout":
            requiredFields["sid"] = "badSid"
        case "login":
            requiredFields["login"]    = "invalidCredentials"
            requiredFields["password"] = "invalidCredentials"
        case "register":
            requiredFields["login"]    = "badLogin"
            requiredFields["password"] = "badPassword"
    }
    var ok bool
    res := utils.JsonAction(action, "badAction")
    if ok, res["result"] = utils.CheckJsonRequest(data, requiredFields); !ok {
        r, _ := json.Marshal(res)
        response = string(r)
    } else {
        switch action {
            case "startTesting":
                response = createResponse(action, "ok")
            case "logout":
                if sid, err := data["sid"].(string); err {
                    response = logoutAction(sid)
                } else {
                    response = createResponse(action, "badSid")
                }
            case "login":
                login, err1  := data["login"].(string)
                passwd, err2 := data["password"].(string)
                if err1 && err2 {
                    response = loginAction(login, passwd)
                } else {
                    response = createResponse(action, "invalidCredentials")
                }
            case "register":
                login, err1  := data["login"].(string)
                passwd, err2 := data["password"].(string)
                if err1 && err2 {
                    response = registerAction(login, passwd)
                } else if err1 {
                    response = createResponse(action, "badLogin")
                } else if err2 {
                    response = createResponse(action, "badPassword")
                }
        }
    }
    fmt.Fprintf(w, "%s", response)
}