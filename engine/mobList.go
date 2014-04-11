package engine

import (
    "bufio"
    "os"
    "strings"
	"MonsterQuest/gameObjects"
	"MonsterQuest/connect"
    "MonsterQuest/utils"
	"MonsterQuest/consts"
	"MonsterQuest/geometry"
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

func (ml *mobList) initializeMobsGenerators(filename string) {
	areas, _ := os.Open(consts.PATH_TO_MAPS + filename)
    defer areas.Close()
    reader := bufio.NewReader(areas)
    for {
        bytes, _, err := reader.ReadLine()
        if err == nil {
            data := strings.Split(string(bytes), ":")
            l, r := utils.ParseFloat(data[0]), utils.ParseFloat(data[1])
            t, b := utils.ParseFloat(data[2]), utils.ParseFloat(data[3])
            mType := utils.ParseInt(data[4])
            duration := utils.ParseFloat(data[5])
            area := geometry.MakeRectangle(geometry.MakePoint(l, t), geometry.MakePoint(r, b))
            ml.addGen(NewMobGenerator(ml.mobKinds[mType], area, duration, ml.pipeline))
        } else {
            break
        }
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
		getGameField().LinkActorToCells(m)
	}
}
