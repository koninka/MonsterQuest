package engine

import (
	"time"
	"MonsterQuest/geometry"
	"MonsterQuest/gameObjects"
	"MonsterQuest/consts"
)

type mobGenerator struct {
	kind *gameObjects.MobKind
	area *geometry.Rectangle
	respawnDuration time.Duration
	pipeline chan gameObjects.Mober
}

func (gen *mobGenerator) run() {
	field := getGameField()
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
			gen.pipeline <- gameObjects.NewMob(gen.kind, x, y)
		}
		time.Sleep(gen.respawnDuration)
	}
}

func NewMobGenerator(kind *gameObjects.MobKind, area *geometry.Rectangle, respawnDuration float64, pipeline chan gameObjects.Mober) *mobGenerator {
	return &mobGenerator{kind, area, time.Duration(respawnDuration) * time.Second, pipeline}
}
