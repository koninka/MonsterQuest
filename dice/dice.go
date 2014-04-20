package dice

import (
    "time"
    "strconv"
    "strings"
    "math/rand"
)

type Dice struct {
    gen    *rand.Rand
    edge   int
    throws int
}

var gen *rand.Rand = rand.New(rand.NewSource(0))

func shake() *rand.Rand {
    return rand.New(rand.NewSource(int64(time.Now().Unix())))
}

func throw(g *rand.Rand, edge_amount, throws_amount int) int {
    var result int = 0
    for i := 0; i < throws_amount; i++ {
        result += g.Intn(edge_amount) + 1
    }
    return result
}

func Shake() {
    gen = shake()
}

func Throw(edge_amount, throws_amount int) int {
    return throw(gen, edge_amount, throws_amount)
}

func CreateDice(sd string) Dice {
    if strings.Index(sd, "d") == -1 {
        sd = "1d2"
    }
    d := strings.Split(sd, "d")
    edge, _   := strconv.Atoi(d[0])
    throws, _ := strconv.Atoi(d[1])
    return Dice{nil, edge, throws}
}

func (d *Dice) Shake() *Dice {
    d.gen = shake()
    return d
}

func (d *Dice) Throw() int {
    if d.gen == nil {
        d.gen = shake()
    }
    return throw(d.gen, d.edge, d.throws)
}