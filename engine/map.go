package engine

import (
    "bufio"
    "os"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjects"
)

type gameField struct {
    width, height int
    field []string
    actors [][]map[int64] gameObjects.Activer
}

func (f *gameField) loadFromFile(fileName string, ml *mobList) {
    file, _ := os.Open(consts.PATH_TO_MAPS + fileName)
    defer file.Close()
    reader := bufio.NewReader(file)
    read := true
    i := 0
    for ; read ; {
        line, _, err := reader.ReadLine()
        for j := 0; j < len(line); j++ {
            if line[j] == 'M' {
                mob := ml.addMob(float64(j), float64(i))
                f.actors[i][j][mob.GetID()] = mob 
                line[j] = '.'
            }
        }
        f.field[i] = string(line)
        read = err == nil
        i++
        if len(line) > 0 && f.width == 0 {
            f.width = len(line)
        }
    }
    f.height = i
}

func (f *gameField) isBlocked(col, row int) bool {
    return col < 0 || col >= f.width || row < 0 || row >= f.height || f.field[row][col] == '#'
}
