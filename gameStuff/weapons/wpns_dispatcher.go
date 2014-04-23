package weapons

import (
    "MonsterQuest/consts"
    "MonsterQuest/gameFight/fightBase"
)

var isInit bool = false
var weapons map[string] fightBase.Blower = make(map[string] fightBase.Blower)

func InitWeapons() {
    weapons[consts.FIST_WEAP] = &FistWeap{BaseWeap{fightBase.NewBaseBlow(fightBase.BM_HIT, 1.0, "hit"), fightBase.CreateDmgDescription("6d4")}}
}

func GetWeapon(name string) fightBase.Blower {
    if !isInit {
        InitWeapons()
        isInit = true
    }
    return weapons[name]
}