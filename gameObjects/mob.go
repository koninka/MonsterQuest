package gameObjects

import (
    "strings"
    "fmt"
    "MonsterQuest/gameFight/blowList"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
    "MonsterQuest/dice"
)

type MobKind struct {
    gameObjectsBase.Kind
    id int64
    name string
    base_hp int
    hp_inc dice.Dice
    description string
    blowList *blowList.BlowList
}

func (mk *MobKind) GetName() string {
    return mk.name
}

func (mk *MobKind) GetDescription() string {
    return mk.description
}

func (mk *MobKind) GenHP() int {
    return mk.base_hp + mk.hp_inc.Shake().Throw()
}

func CreateMobKind(id int64, name string, base_hp int, hp_inc, symbol, description, blowMethods, flagsStr string) *MobKind {
    added := make(map[string] bool)
    kind := MobKind{gameObjectsBase.NewKind(symbol), id, name, base_hp, dice.CreateDice(hp_inc), description, blowList.NewBlowList()}
    for _, blowDesc := range strings.Split(blowMethods, "@") {
        kind.blowList.AddBlowDescription(blowDesc)
    }
    fmt.Println(kind.blowList)
    for _, flagName := range strings.Split(flagsStr, "|") {
        if race, isExist := gameObjectsFlags.GetRaceFlag(flagName); isExist {
            kind.SetRace(race)
        } else {
            flag := gameObjectsFlags.GetFlag(flagName)
            added[flagName] = true
            if flag != nil {
                kind.Flags = append(kind.Flags, flag)
            }
        }
    }
    if !added["NEVER_MOVE"] {
        kind.AddFlag(gameObjectsFlags.GetFlag("CAN_MOVE"))
    }
    if !added["NEVER_BLOW"] {
        kind.AddFlag(gameObjectsFlags.GetFlag("CAN_BLOW"))
    }
    return &kind
}

type Mob struct {
    gameObjectsBase.ActiveObject
    walkingCycle int
}

func (m *Mob) GetDir() int {
    return m.Dir
}

func (m *Mob) SetDir(dir int) {
    m.Dir = dir
}

func (m *Mob) NotifyAboutCollision() {
    if m.Target == nil {
        m.chooseDir()
    }
}

func (m *Mob) GetType() string {
    return consts.MOB_TYPE
}

func (m *Mob) GetInfo() map[string] interface{} {
    return map[string] interface{} {
        "name" : m.Kind.GetName(),
        "description" : m.Kind.GetDescription(),
    }
}

func (m *Mob) Init() {
    m.chooseDir()
}

var directions = [4]int {consts.NORTH_DIR, consts.SOUTH_DIR, consts.WEST_DIR, consts.EAST_DIR}

func (m *Mob) chooseDir() {
    newDir := m.Dir
    for newDir == m.Dir {
        newDir = directions[dice.Throw(2, 2) - 1]
    }
    m.Dir = newDir
}

func (m *Mob) think() {
    if m.Target != nil {
        if geometry.Distance(m.Center, m.Target.GetCenter()) > float64(m.GetRadiusVision()) {
            m.Target = nil
        }
    } else {
        m.walkingCycle++
        if m.walkingCycle == consts.MOB_WALKING_CYCLE_DURATION {
            m.walkingCycle = 0
            m.chooseDir()
        }
    }
}

func (m *Mob) Do() {
    m.think()
    m.DoWithObj(m)
}

func (m *Mob) chooseHorDir(dx float64) {
    if dx > 0 {
        m.Dir = consts.EAST_DIR
    } else {
        m.Dir = consts.WEST_DIR
    }
}

func (m *Mob) chooseVerDir(dy float64) {
    if dy > 0 {
        m.Dir = consts.SOUTH_DIR
    } else {
        m.Dir = consts.NORTH_DIR
    }
}

func (m *Mob) Attack() consts.JsonType {
    var res consts.JsonType = nil
    bl := m.Kind.(*MobKind).blowList
    t, _ := m.GetTarget()
    if d := geometry.Distance(m.GetCenter(), t.GetCenter()); d > 1.0 * 1.4 {
        rbl := bl.GetReachesRangeBlows(d)
        if rbl.Amount() > 0 {
            res = t.GetHit(rbl.ChooseBlowMethod(consts.BT_RANGE), t)
        } else {
            center := t.GetCenter()
            dx := center.X - m.Center.X
            dy := center.Y - m.Center.Y
            if dx > 0.2 {
                m.chooseVerDir(dy)
            } else if dy > 0.2 {
                m.chooseHorDir(dx)
            } else {
                if dice.Throw(6, 15) % 2 == 0 {
                    m.chooseHorDir(dx)
                } else {
                    m.chooseVerDir(dy)
                }
            }
        }
    } else {
        res = t.GetHit(bl.ChooseBlowMethod(consts.BT_MELEE), t)
    }
    if res != nil {
        res["attacker"] = m
        res["target"] = t
    }
    return res
}

func (m *Mob) GetHit(bldesc *blowList.BlowDescription, attacker gameObjectsBase.Activer) consts.JsonType {
    res := m.ActiveObject.GetHit(bldesc, attacker)
    if t, isExist := m.GetTarget(); isExist {
        if t.GetType() != consts.PLAYER_TYPE {
            if attacker.GetType() == consts.PLAYER_TYPE {
                m.SetTarget(attacker)
            } else {
                dice.Shake()
                ary := [2]gameObjectsBase.Activer{t, attacker}
                m.SetTarget(ary[dice.Throw(2, 1) - 1])
            }
        }
    } else {
        m.SetTarget(attacker)
    }
    return res
}

func NewMob(kind *MobKind, x, y float64) Mob {
    d := kind.GenHP()
    fmt.Printf("NewMob: x = %f, y = %f, hp = %d\n", x, y, d)
    m := Mob{gameObjectsBase.NewActiveObject(-1, d, x, y, kind), 0}
    m.chooseDir()
    return m
}
