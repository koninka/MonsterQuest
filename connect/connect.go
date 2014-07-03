package connect

import (
    "fmt"
    "strings"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

type DBComps interface {
    Close() error
}

var db *sql.DB = nil

func CreateConnect() *sql.DB {
    if db == nil {
        db, _ = sql.Open("mysql", "monster_user:qwerty@/monsterquest")
    }
    return db
}

func MakeSelect(from, where string, fields ...string) string {
    var format string = "SELECT %s FROM %s"
    if where != "" {
        return fmt.Sprintf(format + " WHERE %s", strings.Join(fields, ", "), from, where)
    } else {
        return fmt.Sprintf(format, strings.Join(fields, ", "), from)
    }
}
