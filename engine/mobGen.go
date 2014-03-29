package engine

import (
	"time"
	"MonsterQuest/geometry"
	"MonsterQuest/gameObjects"
)

type mobGenerator struct {
	mobType int
	area *geometry.Rectangle
	respawnDuration time.Duration
	pipeline chan gameObjects.Mober
}

func (gen *mobGenerator) run() {
	for {
		time.Sleep(gen.respawnDuration)
	}
}

func NewMobGenerator(mobType int, area *geometry.Rectangle, respawnDuration float64, pipeline chan gameObjects.Mober) *mobGenerator {
	return &mobGenerator{mobType, area, time.Duration(respawnDuration) * time.Second, pipeline}
}
