package weapons

import (
    "MonsterQuest/gameFight/fightBase"
)

type Weapon interface {
    GetDamage() int
}

type BaseWeap struct {
    fightBase.BaseBlow
    DmgDesc fightBase.DmgDescription
}

type FistWeap struct {
    BaseWeap
}

func (bw *BaseWeap) GetDamage() int {
    return bw.DmgDesc.GetDamage()
}