package gameObjects

import (
    "strings"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/geometry"
)

type Mober interface {
    gameObjectsBase.Activer
    NotifyAboutCollision()
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
}

func (m *Mob) CurrDirection() int {
    return -1
}

func (m *Mob) NotifyAboutCollision() {}

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

}

func (m *Mob) think() {
    if m.Target != nil {
        center := m.Target.GetCenter()
        if geometry.Distance(m.Center, center) > float64(m.GetRadiusVision()) {
            // calc dx, dy and find direction
            // save direction
        }
    
    }
}

func (m *Mob) Do() {
    m.think()
    m.ActiveObject.Do()
}

func NewMob(kind *MobKind, x, y float64) Mober {
    m := Mob{gameObjectsBase.NewActiveObject(-1, x, y), kind}
    m.Init()
    return &m
}