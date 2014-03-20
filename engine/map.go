package engine

import (
    "bufio"
    "os"
    "MonsterQuest/consts"
)

type gameField struct {
    width, height int
    field []string
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
