package engine

import (
	"MonsterQuest/gameObjects"
)

type mobList struct {
	mobs map[int64]*gameObjects.Mob
}

var mobcounter int64 = 1000 

func (ml *mobList) addMob(x, y float64) *gameObjects.Mob {
	mob := gameObjects.NewMob(mobcounter, x, y)
	ml.mobs[mobcounter] = &mob
	mobcounter++
	return &mob
}
