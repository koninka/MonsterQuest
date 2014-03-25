package gameObjects

import "MonsterQuest/geometry"

type Mob struct {
	ActiveObject
}

type Mober interface {
	NextDir() string
	Do()
}

func NewMob(id int64, x, y float64) Mob {
	return Mob{ActiveObject{id, geometry.Point{x, y}}}
}

func (m *Mob) NextDir() string {
	return ""
}

func (m *Mob) Do() {}
