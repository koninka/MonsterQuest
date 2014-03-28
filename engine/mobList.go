package engine

import (
	"MonsterQuest/gameObjects"
)

type mobList struct {
	mobs map[int64] gameObjects.Mober
}

var mobcounter int64 = 1000 

func (ml *mobList) addMob(x, y float64) gameObjects.Mober {
	mob := gameObjects.NewMob(mobcounter, x, y)
	ml.mobs[mobcounter] = mob
	mobcounter++
	return mob
}
