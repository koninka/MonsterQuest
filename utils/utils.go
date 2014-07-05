package utils

import (
    "fmt"
    "strconv"
    "math"
    "github.com/nu7hatch/gouuid"
    "math/rand"
    "MonsterQuest/consts"
)

func CheckJsonRequest(req consts.JsonType, results map[string] string) (bool, string) {
    for field, errorMsg := range results {
        if req[field] == nil {
            return false, errorMsg
        }
    }
    return true, "ok"
}

func JsonAction(action, result string) consts.JsonType{
    return consts.JsonType {
        "action" : action,
        "result" : result,
    }
}

func Randint0(max int) int {
    return rand.Intn(max)
}

func ParseFloat(s string) float64 {
    res, err := strconv.ParseFloat(s, 64)
    if err != nil {
        panic(fmt.Sprintf("Try parse \"%s\" in float", s))
    }
    return res
}

func ParseInt(s string) int {
    return int(ParseInt64(s))
}

func ParseInt64(s string) int64 {
    res, err := strconv.ParseInt(s, 10, 64)
    if err != nil {
        panic(fmt.Sprintf("Try parse \"%s\" in int64", s))
    }
    return res
}

func Round(x float64) float64 {
    return math.Ceil(x * 100) / 100
}

var lastId int64 = -1

func GenerateId() int64 {
    lastId++
    return lastId
}

func GenerateSID() string {
    u4, _ := uuid.NewV4()
    return u4.String()
}
