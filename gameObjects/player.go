package gameObjects

import "MonsterQuest/geometry"

type Player struct {
    Login string
    SID string
    DBId int64
    ActiveObject
}

func (p *Player) GetType() string {
	return "player"
}

func (p *Player) GetInfo() map[string] interface{} {
	return map[string] interface{} {"login" : p.Login}
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
	return Player{login, sid, dbId, ActiveObject{id, geometry.Point{x, y}}}
}
