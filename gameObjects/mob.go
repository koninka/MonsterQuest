package gameObjects

import (
    "math/rand"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

type Mober interface {
    Activer
    CurrDirection() int
    Do()
    NotifyAboutCollision()
    SetID(id int64)
    GetKind() int
}

type Mob struct {
    ActiveObject
    kind int
}

func (m *Mob) CurrDirection() int {
    return -1
}

func (m *Mob) Do() {}

func (m *Mob) NotifyAboutCollision() {}

func (m *Mob) GetType() string {
    return "mob"
}

func (m *Mob) SetID(id int64) {
    m.id = id
}

func (m *Mob) GetKind() int {
    return m.kind
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

func NewMob(kind int, x, y float64) Mober {
    if gen.Int() % 2 != 0 {
        return &NumbMob{Mob{ActiveObject{-1, geometry.Point{x, y}}, kind}}
    } else {
        return &WalkingMob{Mob{ActiveObject{-1, geometry.Point{x, y}}, kind}, getRandomDir(), getRandomDir(), throw4Dice1()}
    }
}
