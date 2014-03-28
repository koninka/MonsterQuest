package gameObjects

import "MonsterQuest/geometry"

type Mober interface {
    Activer
    CurrDirection() string
    Do()
}

type Mob struct {
    ActiveObject
}

func (m *Mob) CurrDirection() string {
    return ""
}

func (m *Mob) Do() {}

type NumbMob struct {
    Mob
}

type WalkingMob struct {
    Mob
    currDir string
    nextDir string
}

func (m *WalkingMob) CurrDirection() string {
    return m.currDir
}

func (m *WalkingMob) Do() {
    // some logic 
}

func NewMob(id int64, x, y float64) Mober {
    return &NumbMob{Mob{ActiveObject{id, geometry.Point{x, y}}}}
}
