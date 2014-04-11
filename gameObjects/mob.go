package gameObjects

import (
    "strings"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
)

type Mober interface {
    gameObjectsBase.Activer
    Do()
    NotifyAboutCollision()
    SetID(id int64)
    GetKind() *MobKind
    GetName() string
    GetDescription() string
    HasFlag(flag string) bool
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

func (m *Mob) Do() {}

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

func (m *Mob) GetKind() *MobKind {
    return m.kind
}

func (m *Mob) GetName() string {
    return m.kind.name
}

func (m *Mob) GetDescription() string {
    return m.kind.description
}

func (m *Mob) HasFlag(flag string) bool {
    return m.kind.flags[flag]
}

func (m *Mob) Init() {
    //for flag, _ := range m.kind.flags {
        //m.Behaviors = append(m.Behaviors, gameObjectsBehavior.GetBehavior(flag))
    //}
    m.Behaviors = append(m.Behaviors, gameObjectsBehavior.GetBehavior("CAN_MOVE"))
}

func NewMob(kind *MobKind, x, y float64) Mober {
    return &Mob{gameObjectsBase.ActiveObject{-1, -1, geometry.Point{x, y}, make([]gameObjectsBase.Flager, 0, 1000)}, kind}
}