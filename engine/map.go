package engine

import (
    "bufio"
    "io/ioutil"
    "os"
    "strings"
    "strconv"
    "fmt"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjects"
    "MonsterQuest/geometry"
)

type gameField struct {
    width, height int
    field []string
    actors [][]map[int64] gameObjects.Activer
}

func parseFloat(s string) float64 {
    res, err := strconv.ParseFloat(s, 64)
    if err != nil {
        panic(fmt.Sprintf("Try parse \"%s\" in float", s))
    }
    return res
}

func parseInt(s string) int64 {
    res, err := strconv.ParseInt(s, 10, 64)
    if err != nil {
        panic(fmt.Sprintf("Try parse \"%s\" in int64", s))
    }
    return res
}

func (f *gameField) loadFromStrings(strs []string) bool {
    var l int
    equiv := false
    notEmpty := len(strs) > 0
    if notEmpty {
        equiv = true
        l = len(strs[0])
        for _, str := range strs {
            equiv = equiv && len(str) == l
        }
    }
    correct := notEmpty && equiv && l > 0
    if correct {
        copy(f.field, strs)
        f.width = len(f.field[0])
        f.height = len(f.field)
    }
    return correct
}

func (f *gameField) loadFromFile(mapFile, areasFile string, ml *mobList) {
    content, err := ioutil.ReadFile(consts.PATH_TO_MAPS + mapFile)
    strs := strings.Split(string(content), "\n")
    strs[len(strs) - 1] += "\n"
    if err != nil || !f.loadFromStrings(strs) {
        panic(fmt.Sprintf("Load map from file %s failed", mapFile))
    }
    areas, _ := os.Open(consts.PATH_TO_MAPS + areasFile)
    defer areas.Close()
    reader := bufio.NewReader(areas)
    for {
        bytes, _, err := reader.ReadLine()
        if err == nil {
            data := strings.Split(string(bytes), ":")
            l, r := parseFloat(data[0]), parseFloat(data[1])
            t, b := parseFloat(data[2]), parseFloat(data[3])
            mType := parseInt(data[4])
            duration := parseFloat(data[5])
            area := geometry.MakeRectangle(geometry.MakePoint(l, t), geometry.MakePoint(r, b))
            ml.addGen(NewMobGenerator(ml.mobKinds[mType], area, duration, ml.pipeline))
        } else {
            break
        }
    }
}

func (f *gameField) isBlocked(col, row int) bool {
    return col < 0 || col >= f.width || row < 0 || row >= f.height || f.field[row][col] == '#'
}

func (f *gameField) isFree(col, row int) bool {
    return !f.isBlocked(col, row) && len(f.actors[row][col]) == 0
}
