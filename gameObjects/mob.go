package gameObjects

import "MonsterQuest/MonsterQuest/geometry"

type Mob struct {
	ActiveObject
}

func NewMob(id int64, x, y float64) Mob {
	return Mob{ActiveObject{id, geometry.Point{x, y}}}
}

func (m *Mob) Do() {
	// do something
}
