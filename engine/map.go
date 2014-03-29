package engine

import (
    "bufio"
    "os"
    "strings"
    "strconv"
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
        return 0 // panic will be here
    }
    return res
}

func parseInt(s string) int {
    res, err := strconv.ParseInt(s, 10, 64)
    if err != nil {
        return 0 // same situation as above
    }
    return int(res)
}

func (f *gameField) loadFromFile(mapFile, areasFile string, ml *mobList) {
    file, _ := os.Open(consts.PATH_TO_MAPS + mapFile)
    defer file.Close()
    reader := bufio.NewReader(file)
    read := true
    i := 0
    for ; read ; {
        line, _, err := reader.ReadLine()
        f.field[i] = string(line)
        read = err == nil
        i++
        if len(line) > 0 && f.width == 0 {
            f.width = len(line)
        }
    }
    f.height = i
    areas, _ := os.Open(consts.PATH_TO_MAPS + areasFile)
    defer areas.Close()
    reader = bufio.NewReader(areas)
    read = true
    for {
        bytes, _, err := reader.ReadLine()
        if err == nil {
            data := strings.Split(string(bytes), ":")
            l, r := parseFloat(data[0]), parseFloat(data[1])
            t, b := parseFloat(data[2]), parseFloat(data[3])
            mType := parseInt(data[4])
            duration := parseFloat(data[5])
            area := geometry.MakeRectangle(geometry.MakePoint(l, t), geometry.MakePoint(r, b))
            ml.addGen(NewMobGenerator(mType, area, duration, ml.pipeline))
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
