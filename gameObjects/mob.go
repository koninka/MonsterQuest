package gameObjects

import (
    "math/rand"
    "strings"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

type Mober interface {
    Activer
    CurrDirection() int
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
    ActiveObject
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
    m.id = id
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

type NumbMob struct {
    Mob
}

var gen = rand.New(rand.NewSource(0))
var directions = [...]int {consts.SOUTH_DIR, consts.EAST_DIR, consts.WEST_DIR, consts.NORTH_DIR}
const CYCLE_DURATION_IN_TICKS = 10

func throw4Dice1() int {
    return gen.Int() % 4
}

func getRandomDir() int {
    return directions[throw4Dice1()]
}

type WalkingMob struct {
    Mob
    currDir int
    nextDir int
    cycleCounter int
}

func (m *WalkingMob) CurrDirection() int {
    return m.currDir
}

func (m *WalkingMob) Do() {
    m.cycleCounter = (m.cycleCounter + 1) % CYCLE_DURATION_IN_TICKS
    if m.cycleCounter == 0 {
        m.currDir = m.nextDir
        m.nextDir = getRandomDir()
    }
}

func (m *WalkingMob) NotifyAboutCollision() {
    collisionDir := m.currDir
    for newDir := getRandomDir(); newDir != collisionDir; newDir = getRandomDir() {
        m.currDir = newDir
    }
}

func NewMob(kind *MobKind, x, y float64) Mober {
    if gen.Int() % 2 != 0 {
        return &NumbMob{Mob{ActiveObject{-1, geometry.Point{x, y}}, kind}}
    } else {
        return &WalkingMob{Mob{ActiveObject{-1, geometry.Point{x, y}}, kind}, getRandomDir(), getRandomDir(), throw4Dice1()}
    }
}
