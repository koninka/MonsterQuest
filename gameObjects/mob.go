package gameObjects

import (
    "strings"
    "math/rand"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

type Mober interface {
    gameObjectsBase.Activer
    SetID(id int64)
    GetKind() *MobKind
    GetName() string
    GetDescription() string
}

type MobKind struct {
    id int64
    name string
    description string
    flags map[string] bool
}

func CreateMobKind(id int64, name, description, flagsStr string) *MobKind {
    kind := MobKind{id, name, description, make(map[string] bool)}
    for _, flag := range strings.Split(flagsStr, "|") {
        kind.flags[flag] = true
    }
    return &kind
}

type Mob struct {
    gameObjectsBase.ActiveObject
    kind *MobKind
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
        "name" : m.kind.name,
        "description" : m.kind.description,
    }
}

func (m *Mob) SetID(id int64) {
    m.Id = id
}

func (m *Mob) GetName() string {
    return m.kind.name
}

func (m *Mob) GetDescription() string {
    return m.kind.description
}

func (m *Mob) GetKind() *MobKind {
    return m.kind
}

func (m *Mob) Init() {
    //for flag, _ := range m.kind.flags {
        //m.Behaviors = append(m.Behaviors, gameObjectsBehavior.GetBehavior(flag))
    //}
    m.Flags = append(m.Flags, gameObjectsFlags.GetFlag("CAN_MOVE"))
    m.chooseDir()
}

var directions = [4]int {consts.NORTH_DIR, consts.SOUTH_DIR, consts.WEST_DIR, consts.EAST_DIR}
var gen *rand.Rand = rand.New(rand.NewSource(0))

func (m *Mob) chooseDir() {
    newDir := directions[gen.Int() % 4]
    for newDir == m.Dir {
        newDir = directions[gen.Int() % 4]
    }
    m.Dir = newDir
}

func (m *Mob) think() {
    if m.Target != nil {
        center := m.Target.GetCenter()
        if geometry.Distance(m.Center, center) > float64(m.GetRadiusVision()) {
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

func NewMob(kind *MobKind, x, y float64) Mober {
    m := Mob{gameObjectsBase.NewActiveObject(-1, x, y), kind, 0}
    m.Init()
    return &m
}