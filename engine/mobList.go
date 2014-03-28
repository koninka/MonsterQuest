package engine

import (
	"MonsterQuest/gameObjects"
)

type mobList struct {
	mobs map[int64] gameObjects.Mober
}

func (ml *mobList) addMob(id int64, x, y float64) gameObjects.Mober {
	mob := gameObjects.NewMob(id, x, y)
	ml.mobs[id] = mob
	return mob
}
