package gameBlows

import (
    "fmt"
    "strings"
    "strconv"
    "MonsterQuest/dice"
)

type DmgDescription struct {
    edge_amount   int
    throws_amount int
}

type BlowDescription struct {
    DmgDesc DmgDescription
    method Blower
}

type BlowList struct {
    hasRangeBlows bool
    blows []*BlowDescription
    meleeBlows []int
    rangeBlows []int
}

func createDmgDescription(damage string) DmgDescription {
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

func (bld *BlowDescription) GetBlowType() string {
    return bld.method.GetType()
}

func NewBlowList() *BlowList {
    return &BlowList{hasRangeBlows: false}
}

func (bl *BlowList) addBlow(bdesc *BlowDescription) {
    var isRange bool = bdesc.method.isRange()
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
    bl.addBlow(&BlowDescription{createDmgDescription(blow_damage), GetBlowMethod(blow_name)})
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
    for (bt == btMELEE && blow.method.isRange()) || (bt == btRANGE && !blow.method.isRange()) {
        blow = bl.blows[dice.Throw(len(bl.blows), 1) - 1]
    }
    return blow
}
