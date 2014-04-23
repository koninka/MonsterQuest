package gameObjects

import (
    "fmt"
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameFight/fightBase"
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

func (p *Player) GetInfo() map[string] interface{} {
    return map[string] interface{} {"login" : p.Login}
}

func (p *Player) Do() {
    //p.ActiveObject.Do()
    p.DoWithObj(p)
    p.Dir = -1
}

func (p *Player) Attack() consts.JsonType {
    var res consts.JsonType = nil
    t, _ := p.GetTarget()
    fmt.Println("player Attack somebody")
    res = t.GetHit(p.weapon, p)
    if res != nil {
        res["attacker"] = p
        res["target"] = t
    }
    return res
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
    return Player{gameObjectsBase.NewActiveObject(id, consts.INITIAL_PLAYER_HP, x, y, getPlayerKind()), login, sid, dbId, wpns.GetWeapon(consts.FIST_WEAP)}
}

func (p *Player) GetHit(blow fightBase.Blower, attacker gameObjectsBase.Activer) consts.JsonType {
    fmt.Println("player get hit")
    res := p.ActiveObject.GetHit(blow, attacker)
    fmt.Println(res)
    return res
}
