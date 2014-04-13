package cube

import (
    "math/rand"
    "time"
)

var gen *rand.Rand = rand.New(rand.NewSource(0))

func Shake() {
    gen = rand.New(rand.NewSource(int64(time.Now().Unix())))
}

func Throw(edge_amount, throws_amount int) int {
    var result int = 0
    for i := 0; i < throws_amount; i++ {
        result += rand.Intn(edge_amount) + 1
    }
    return result
}