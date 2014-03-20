package engine

import (
    "bufio"
    "os"
    "MonsterQuest/MonsterQuest/consts"
    "MonsterQuest/MonsterQuest/gameObjects"
)

type gameField struct {
    width, height int
    field []string
    players [][]map[string]bool
}

func (f *gameField) loadFromFile(fileName string) {
    file, _ := os.Open(consts.PATH_TO_MAPS + fileName)
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
}

func (f *gameField) isBlocked(col, row int) bool {
    if col < 0 || col >= f.width || row < 0 || row >= f.height {
        return true
    } else {
        return f.field[row][col] == '#'
    }
}
