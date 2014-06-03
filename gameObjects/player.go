package gameObjects

import (
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
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
        kind = &playerKind{gameObjectsBase.NewKind("p")}
        kind.SetRace(consts.PLAYER_RACE)
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
    weapon fightBase.Blower
}

func (p *Player) GetType() string {
    return consts.PLAYER_TYPE
}

func (p *Player) GetInfo() consts.JsonType {
    info := p.ActiveObject.GetInfo()
    info["login"] = p.Login
    info["type"] = consts.PLAYER_TYPE
    return info
}

func (p *Player) Do() {
    //p.ActiveObject.Do()
    p.DoWithObj(p)
    p.Dir = -1
}

func (p *Player) Attack() consts.JsonType {
    var res consts.JsonType = nil
    t, _ := p.GetTarget()
    if d := geometry.Distance(p.GetCenter(), t.GetCenter()); d < 1.4 {
        res = t.GetHit(p.weapon, p)
    }
    if res != nil {
        res["attacker"] = p.GetID()
        res["target"] = t.GetID()
    }
    p.Target = nil
    return res
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
    return Player{gameObjectsBase.NewActiveObject(id, consts.INITIAL_PLAYER_HP, x, y, getPlayerKind()), login, sid, dbId, wpns.GetWeapon(consts.FIST_WEAP)}
}

func (p *Player) GetHit(blow fightBase.Blower, attacker gameObjectsBase.Activer) consts.JsonType {
    res := p.ActiveObject.GetHit(blow, attacker)
    return res
}
