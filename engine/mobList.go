package engine

import (
	"MonsterQuest/gameObjects"
	"MonsterQuest/connect"
)

type mobList struct {
	mobs map[int64] gameObjects.Mober
	mobGens []*mobGenerator
	pipeline chan gameObjects.Mober
	mobKinds map[int64] *gameObjects.MobKind
}

func (ml *mobList) initializeMobTypes() {
	db := connect.CreateConnect()
	rows, _ := db.Query("SELECT id, name, description, flags FROM mobs_types")
	for rows.Next() {
		var id int64
		var name, desc, flags string
		rows.Scan(&id, &name, &desc, &flags)
		ml.mobKinds[id] = gameObjects.CreateMobKind(id, name, desc, flags)
	}
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
		GetInstance().linkActorToCells(m)
	}
}
