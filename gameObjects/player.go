package gameObjects

import (
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/consts"
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
        kind = &playerKind{gameObjectsBase.NewKind("p", consts.PLAYER)}
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
    weapon wpns.Weapon
}

func (p *Player) GetType() string {
    return consts.PLAYER_TYPE
}

func (p *Player) GetInfo() map[string] interface{} {
    return map[string] interface{} {"login" : p.Login}
}

func (p *Player) Do() {
    p.ActiveObject.Do()
    p.Dir = -1
}

func (p *Player) Attack() consts.JsonType {
    var res consts.JsonType = nil
    // t, _ := p.GetTarget()
    // res = t.GetHit(p.weapon)
    return res
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
    return Player{gameObjectsBase.NewActiveObject(id, consts.INITIAL_PLAYER_HP, x, y, getPlayerKind()), login, sid, dbId, &wpns.FistWeap{wpns.BaseWeap{fightBase.NewBaseBlow(fightBase.BM_HIT, 0.8, "hit"), fightBase.CreateDmgDescription("4d3")}}}
}
