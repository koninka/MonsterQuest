package blowList

import (
    "fmt"
    "strings"
    "MonsterQuest/dice"
    "MonsterQuest/gameFight/blows"
    "MonsterQuest/gameFight/fightUtils"
    fc "MonsterQuest/gameFight/fightConsts"
)

type BlowDescription struct {
    DmgDesc fightUtils.DmgDescription
    method blows.Blower
}

type BlowList struct {
    hasRangeBlows bool
    blows []*BlowDescription
    meleeBlows []int
    rangeBlows []int
}

func (bld *BlowDescription) GetBlowType() string {
    return bld.method.GetType()
}

func NewBlowList() *BlowList {
    return &BlowList{hasRangeBlows: false}
}

func (bl *BlowList) addBlow(bdesc *BlowDescription) {
    var isRange bool = bdesc.method.IsRange()
    bl.blows = append(bl.blows, bdesc)
    bl.hasRangeBlows = bl.hasRangeBlows || isRange
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
    return bl.hasRangeBlows
}

func (bl *BlowList) AddBlowDescription(desc string) {
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
    fmt.Println(blow_name)
    bl.addBlow(&BlowDescription{fightUtils.CreateDmgDescription(blow_damage), blows.GetBlowMethod(blow_name)})
}

func (bl *BlowList) GetReachesRangeBlows(d float64) BlowList {
    var res BlowList
    for _, i := range bl.rangeBlows {
        if d <= bl.blows[i].method.GetBlowRadius() {
            res.addBlow(bl.blows[i])
        }
    }
    return res
}

func (bl *BlowList) ChooseBlowMethod(bt int) *BlowDescription {
    dice.Shake()
    blow := bl.blows[dice.Throw(len(bl.blows), 1) - 1]
    for (bt == fc.BT_MELEE && blow.method.IsRange()) || (bt == fc.BT_RANGE && !blow.method.IsRange()) {
        blow = bl.blows[dice.Throw(len(bl.blows), 1) - 1]
    }
    return blow
}
