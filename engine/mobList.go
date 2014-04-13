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
    "MonsterQuest/gameObjectsFlags"
)

type mobList struct {
    mobs map[int64] *gameObjects.Mob
    mobGens []*mobGenerator
    pipeline chan gameObjects.Mob
    mobKinds map[int64] *gameObjects.MobKind
}

func (ml *mobList) initializeMobTypes() {
	gameObjectsFlags.InitFlags(&GetInstance().field, GetInstance().msgsChannel)
	db := connect.CreateConnect()
	rows, _ := db.Query("SELECT id, name, description, flags, race FROM mobs_types")
	for rows.Next() {
		var id int64
		var race int
		var name, desc, flags string
		rows.Scan(&id, &name, &desc, &flags, &race)
		ml.mobKinds[id] = gameObjects.CreateMobKind(id, race, name, desc, flags)
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
            if kind, isExist := ml.mobKinds[mType]; isExist {
                ml.addGen(NewMobGenerator(kind, area, duration, ml.pipeline))
            }
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
		ml.mobs[id] = &m
		m.SetID(id)
		GetInstance().field.LinkActorToCells(&m)
	}
}
