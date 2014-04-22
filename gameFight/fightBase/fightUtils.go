package fightBase

import (
    "MonsterQuest/dice"
)

type DmgDescription struct {
    dice.Dice
}

func CreateDmgDescription(damage string) DmgDescription {
    return DmgDescription{dice.CreateDice(damage)}
}

func (dd *DmgDescription) GetDamage() int {
    return dd.Dice.Shake().Throw()
}