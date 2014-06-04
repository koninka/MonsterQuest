package utils

import (
    "fmt"
    "strconv"
    "math"
    "math/rand"
)

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

func ParseInt(s string) int64 {
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
