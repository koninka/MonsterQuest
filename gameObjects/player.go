package gameObjects

import (
	"MonsterQuest/gameObjectsBase"
	"MonsterQuest/gameObjectsFlags"
)

type playerKind struct {
	gameObjectsBase.Kind
}

func (pk *playerKind) GetName() string {
	return "player"
}

func (pk *playerKind) GetDescription() string {
	return ""
}

var kind *playerKind

func getPlayerKind() *playerKind {
	if kind == nil {
		kind = &playerKind{gameObjectsBase.NewKind(-1)}
		kind.Flags = append(kind.Flags, gameObjectsFlags.GetFlag("CAN_MOVE"))
		kind.Flags = append(kind.Flags, gameObjectsFlags.GetFlag("CAN_BLOW"))
	}
	return kind
}

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
	p.Flags = append(p.Flags, gameObjectsFlags.GetFlag("CAN_MOVE"))
}

func (p *Player) Do() {
	p.ActiveObject.Do()
	p.Dir = -1
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
	p := Player{gameObjectsBase.NewActiveObject(id, x, y), login, sid, dbId}
	p.Init()
	return p
}
