package engine

import (
	"MonsterQuest/gameObjects"
)

type mobList struct {
	mobs map[int64] gameObjects.Mober
	mobGens []*mobGenerator
	pipeline chan gameObjects.Mober
}

func (ml *mobList) addGen(gen *mobGenerator) {
	ml.mobGens = append(ml.mobGens, gen)
}

func (ml *mobList) runGens() {
	for _, gen := range ml.mobGens {
		go gen.run()
	}
}

func (ml *mobList) run() {
	ml.runGens()
	for {
		m := <-ml.pipeline
		id := GenerateId()
		ml.mobs[id] = m
		m.SetID(id)
	}
}
