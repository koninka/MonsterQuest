package gameObjects

import (
    "strings"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
    "MonsterQuest/cube"
)

type MobKind struct {
    gameObjectsBase.Kind
    id int64
    name string
    description string
}

func (mk *MobKind) GetName() string {
    return mk.name
}

func (mk *MobKind) GetDescription() string {
    return mk.description
}

func CreateMobKind(id int64, race int, name, description, flagsStr string) *MobKind {
    var added map[string] bool
    kind := MobKind{gameObjectsBase.NewKind(race), id, name, description}
    for _, flagName := range strings.Split(flagsStr, "|") {
        flag := gameObjectsFlags.GetFlag(flagName)
        if flag != nil {
            added[flagName] = true
            kind.Flags = append(kind.Flags, flag)
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
    m.chooseDir()
}

func (m *Mob) GetType() string {
    return "mob"
}

func (m *Mob) GetInfo() map[string] interface{} {
    return map[string] interface{} {
        "name" : m.Kind.GetName(),
        "description" : m.Kind.GetDescription(),
    }
}

func (m *Mob) SetID(id int64) {
    m.Id = id
}

func (m *Mob) GetKind() gameObjectsBase.Kinder {
    return m.Kind
}

func (m *Mob) Init() {
    m.chooseDir()
}

var directions = [4]int {consts.NORTH_DIR, consts.SOUTH_DIR, consts.WEST_DIR, consts.EAST_DIR}

func (m *Mob) chooseDir() {
    cube.Shake()
    newDir := m.Dir
    for newDir == m.Dir {
        newDir = directions[cube.Throw(4, 1) - 1]
    }
    m.Dir = newDir
}

func (m *Mob) think() {
    if m.Target != nil {
        center := m.Target.GetCenter()
        if geometry.Distance(m.Center, center) < float64(m.GetRadiusVision()) {
            // calc dx, dy and find direction
            // save direction
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
    m.ActiveObject.Do()
}

func (m *Mob) Attack() {

}

func NewMob(kind *MobKind, x, y float64) Mob {
    m := Mob{gameObjectsBase.NewActiveObject(-1, x, y, kind), 0}
    m.chooseDir()
    return m
}