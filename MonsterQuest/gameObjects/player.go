package gameObjects

import "MonsterQuest/MonsterQuest/geometry"

type Player struct {
    Login string
    ActiveObject
}

func NewPlayer(login string, x, y float64) Player {
	return Player{login, ActiveObject{geometry.Point{x, y}}}
}

