package gameObjects

import "MonsterQuest/MonsterQuest/geometry"

type Mob struct {
	id int64
	ActiveObject
}

func NewMob(id int64, x, y float64) Mob {
	return Mob{id, ActiveObject{geometry.Point{x, y}}}
}

func (m *Mob) Do() {
	// do something
}
