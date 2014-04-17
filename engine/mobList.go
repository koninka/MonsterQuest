package engine

import (
    "fmt"
    "bufio"
    "os"
    "strings"
    "time"
    "MonsterQuest/gameFight/blows"
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
    mobsDepth map[int64] []*gameObjects.MobKind
}

func (ml *mobList) takeAwayMob(m *gameObjects.Mob) {
    delete(ml.mobs, m.GetID())
    time.Sleep(consts.LIVING_AFTER_DEAD_DURATION)
    GetInstance().field.UnlinkActorFromCells(m)
}

func (ml *mobList) initializeMobTypes() consts.JsonType {
    blows.InitBlowMethods();
	gameObjectsFlags.InitFlags(&GetInstance().field, GetInstance().msgsChannel)
	db := connect.CreateConnect()
	rows, _ := db.Query("SELECT id, name, symbol, description, blow_method, flags, level_info, race FROM mobs_types")
    mobDictionary := make(consts.JsonType)
	for rows.Next() {
		var (
            id int64
            race int
            name, symbol, desc, flags, blowMethods, level_info string
        )
		rows.Scan(&id, &name, &symbol, &desc, &blowMethods, &flags, &level_info, &race)
        depth := utils.ParseInt(strings.Split(level_info, "|")[0])
        fmt.Printf("mob name = %s, mob depth = %d\n", name, depth)
		ml.mobsDepth[depth] = append(ml.mobsDepth[depth], gameObjects.CreateMobKind(id, race, name, symbol, desc, blowMethods, flags))
        mobDictionary[symbol] = name
	}
    return mobDictionary
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
            depth := utils.ParseInt(data[4])
            duration := utils.ParseFloat(data[5])
            area := geometry.MakeRectangle(geometry.MakePoint(l, t), geometry.MakePoint(r, b))
            fmt.Printf("gen depth = %d\n", depth)
            if kinds, isExist := ml.mobsDepth[depth]; isExist {
                ml.addGen(NewMobGenerator(&kinds, area, duration, ml.pipeline))
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
