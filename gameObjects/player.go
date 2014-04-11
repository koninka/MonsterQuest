package gameObjects

import (
	"MonsterQuest/gameObjectsBase"
	"MonsterQuest/gameObjectsBehavior"
)
type Player struct {
    gameObjectsBase.ActiveObject
    Login string
    SID string
    DBId int64
}

func (p *Player) GetType() string {
	return "player"
}

func (p *Player) GetInfo() map[string] interface{} {
	return map[string] interface{} {"login" : p.Login}
}

func (p *Player) Init() {
	p.Behaviors = append(p.Behaviors, gameObjectsBehavior.GetBehavior("CAN_MOVE"))
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
	p := Player{gameObjectsBase.NewActiveObject(id, x, y), login, sid, dbId}
	p.Init()
	return p
}
