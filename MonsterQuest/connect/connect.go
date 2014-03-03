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

func CreateConnect() *sql.DB {
    db, _ := sql.Open("mysql", "monster_user:qwerty@/monsterquest")
    return db
}

func CloseDB(comps ...DBComps) {
    for _, comp := range comps {
        if comp != nil {
            comp.Close()
        }
    }
}

func MakeSelect(from, where string, fields ...string) string {
    var format string = "SELECT %s FROM %s"
    if where != "" {
        return fmt.Sprintf(format + " WHERE %s", strings.Join(fields, ", "), from, where)
    } else {
        return fmt.Sprintf(format, strings.Join(fields, ", "), from)
    }
}