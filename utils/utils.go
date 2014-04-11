package utils

import (
	"fmt"
	"strconv"
)

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
