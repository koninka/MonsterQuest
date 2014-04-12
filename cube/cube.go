package cube

import (
    "math/rand"
    "time"
)

func Throw(edge_amount, throws_amount int) int {
    var result int = 0
    rand.Seed(int64(time.Now().Unix()))
    for i := 0; i < throws_amount; i++ {
        result += rand.Intn(edge_amount) + 1
    }
    return result
}