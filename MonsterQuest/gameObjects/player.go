package gameObjects

import "MonsterQuest/MonsterQuest/geometry"

type Player struct {
    Login string
<<<<<<< HEAD
    ActiveObject
}

func NewPlayer(login string, x, y float64) Player {
	return Player{login, ActiveObject{geometry.Point{x, y}}}
=======
    SID string
    ActiveObject
}

func NewPlayer(login, sid string, x, y float64) Player {
	return Player{login, sid, ActiveObject{geometry.Point{x, y}}}
>>>>>>> collisionDetection
}

