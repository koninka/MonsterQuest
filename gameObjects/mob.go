package gameObjects

import "MonsterQuest/geometry"

type Mober interface {
    Activer
    CurrDirection() string
    Do()
}

type Mob struct {
    ActiveObject
}

func (m *Mob) CurrDirection() string {
    return ""
}

func (m *Mob) Do() {}

type NumbMob struct {
    Mob
}

var gen = rand.New(rand.NewSource(0))
var directions = [...]string {"south", "east", "west", "north"}
const CYCLE_DURATION_IN_TICKS = 10

func throw4Dice1() int {
    return gen.Int() % 4
}

func getRandomDir() string {
    return directions[throw4Dice1()]
}

type WalkingMob struct {
    Mob
    currDir string
    nextDir string
    cycleCounter int
}

func (m *WalkingMob) CurrDirection() string {
    return m.currDir
}

func (m *WalkingMob) Do() {
    m.cycleCounter = (m.cycleCounter + 1) % CYCLE_DURATION_IN_TICKS
    if m.cycleCounter == 0 {
        m.currDir = m.nextDir
        m.nextDir = getRandomDir()
    }
}
}

func NewMob(id int64, x, y float64) Mober {
    if gen.Int() % 2 != 0 {
        return &NumbMob{Mob{ActiveObject{id, geometry.Point{x, y}}}}
    } else {
        return &WalkingMob{Mob{ActiveObject{id, geometry.Point{x, y}}}, getRandomDir(), getRandomDir(), throw4Dice1()}
    }
}
