package fightBase

import (
    "strings"
    "strconv"
    "MonsterQuest/dice"
)

type DmgDescription struct {
    edge_amount   int
    throws_amount int
}

func CreateDmgDescription(damage string) DmgDescription {
    if strings.Index(damage, "d") == -1 {
        damage = "1d2" //must be default value for blow method
    }
    d := strings.Split(damage, "d")
    edge_amount, _   := strconv.Atoi(d[0])
    throws_amount, _ := strconv.Atoi(d[1])
    return DmgDescription{edge_amount, throws_amount}
}

func (dd *DmgDescription) GetDamage() int {
    dice.Shake()
    return dice.Throw(dd.edge_amount, dd.throws_amount)
}