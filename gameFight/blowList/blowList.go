package blowList

import (
    "strings"
    "MonsterQuest/dice"
    "MonsterQuest/gameFight/blows"
    "MonsterQuest/gameFight/fightBase"
)

type BlowLister interface {
    addBlow(fightBase.Blower)
    Amount() int
    HasRangeBlows() bool
    GetReachesRangeBlows(float64) BlowLister
    ChooseBlowMethod(int) fightBase.Blower
    AddMobBlowDesc(string)
}

type BlowList struct {
    blows []fightBase.Blower
    meleeBlows []int
    rangeBlows []int
}

func NewBlowList() BlowLister {
    return &BlowList{}
}

func (bl *BlowList) addBlow(blow fightBase.Blower) {
    var isRange bool = blow.IsRange()
    bl.blows = append(bl.blows, blow)
    var b *[]int
    if isRange {
        b = &(bl.meleeBlows)
    } else {
        b = &(bl.rangeBlows)
    }
    *b = append(*b, len(bl.blows) - 1)
}

func (bl *BlowList) Amount() int {
    return len(bl.blows)
}

func (bl *BlowList) HasRangeBlows() bool {
    return len(bl.rangeBlows) > 0
}

func (bl *BlowList) GetReachesRangeBlows(d float64) BlowLister {
    res := NewBlowList()
    for _, i := range bl.rangeBlows {
        if d <= bl.blows[i].GetBlowRadius() {
            res.addBlow(bl.blows[i])
        }
    }
    return res
}

func (bl *BlowList) ChooseBlowMethod(bt int) fightBase.Blower {
    dice.Shake()
    blow := bl.blows[dice.Throw(len(bl.blows), 1) - 1]
    for (bt == fightBase.BT_MELEE && blow.IsRange()) || (bt == fightBase.BT_RANGE && !blow.IsRange()) {
        blow = bl.blows[dice.Throw(len(bl.blows), 1) - 1]
    }
    return blow
}

func (bl *BlowList) AddMobBlowDesc(desc string) {
    bda := strings.Split(desc, "|")
    var (
        blow_name string = bda[0]
        // blow_effect string = ""
        blow_damage string = ""
    )
    // if len(bda) == 2 {
    //     blow_effect = bda[1]
    // }
    if len(bda) == 3 {
        blow_damage = bda[2]
    }
    // bl.addBlow(&BlowDescription{fightBase.CreateDmgDescription(blow_damage), blows.GetBlowMethod(blow_name)})
    bl.addBlow(blows.NewMobBlow(blow_damage, blow_name))
}