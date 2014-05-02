package gameObjectsFlags

import (
    "math"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/consts"
)

type KillWallFlag struct {
    Flag
}

func (k *KillWallFlag) Do(obj gameObjectsBase.Activer) {
    if pt := obj.GetAttackPoint(); pt != nil {
        x, y := int(math.Ceil(pt.X)), int(math.Ceil(pt.Y))
        if  !k.field.IsBlocked(x, y) {
            k.field.SetCell(x, y, consts.GRASS_SYMBOL)
        }
    }
}