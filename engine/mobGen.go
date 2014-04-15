package engine

import (
    "time"
    "MonsterQuest/geometry"
    "MonsterQuest/gameObjects"
    "MonsterQuest/consts"
    "MonsterQuest/dice"
)

type mobGenerator struct {
    kinds *[]*gameObjects.MobKind
    area *geometry.Rectangle
    respawnDuration time.Duration
    pipeline chan gameObjects.Mob
}

func (gen *mobGenerator) run() {
    field := &GetInstance().field
    for {
        var x, y float64
        var placeFound = false
        for i := int(gen.area.LeftTop.Y); i <= int(gen.area.RightBottom.Y); i++ {
            for j := int(gen.area.LeftTop.X); j <= int(gen.area.RightBottom.X); j++ {
                if field.IsFree(j, i) {
                    x = float64(j) + consts.OBJECT_HALF
                    y = float64(i) + consts.OBJECT_HALF
                    placeFound = true
                    break;
                }
            }
        }
        if placeFound {
            dice.Shake()
            gen.pipeline <- gameObjects.NewMob((*gen.kinds)[dice.Throw(len(*gen.kinds), 1) - 1], x, y)
        }
        time.Sleep(gen.respawnDuration)
    }
}

func NewMobGenerator(kinds *[]*gameObjects.MobKind, area *geometry.Rectangle, respawnDuration float64, pipeline chan gameObjects.Mob) *mobGenerator {
    return &mobGenerator{kinds, area, time.Duration(respawnDuration) * time.Second, pipeline}
}
