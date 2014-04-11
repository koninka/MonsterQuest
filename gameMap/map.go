package gameMap

import (
    "io/ioutil"
    "strings"
    "fmt"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjectsBase"
)

type GameField struct {
    Width, Height int
    Field []string
    Actors [][]map[int64] gameObjectsBase.Activer
}

func NewGameField() GameField {
    field := GameField{
        Field: make([]string, 1000),
        Actors: make([][]map[int64] gameObjectsBase.Activer, 1000),
    }
    for i := range field.Field {
        field.Actors[i] = make([]map[int64] gameObjectsBase.Activer, 1000)
        for j := range field.Actors[i] {
            field.Actors[i][j] = make(map[int64] gameObjectsBase.Activer)
        }
    }
    return field
}

func (f *GameField) LoadFromStrings(strs []string) bool {
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
        copy(f.Field, strs)
        f.Width = len(f.Field[0])
        f.Height = len(f.Field)
    }
    return correct
}

func (f *GameField) LoadFromFile(mapFile string) {
    content, err := ioutil.ReadFile(consts.PATH_TO_MAPS + mapFile)
    strs := strings.Split(string(content), "\n")
    strs[len(strs) - 1] += "\n"
    if err != nil || !f.LoadFromStrings(strs) {
        panic(fmt.Sprintf("Load map from file %s failed", mapFile))
    }
}

func (f *GameField) IsBlocked(col, row int) bool {
    return col < 0 || col >= f.Width || row < 0 || row >= f.Height || f.Field[row][col] == '#'
}

func (f *GameField) IsFree(col, row int) bool {
    return !f.IsBlocked(col, row) && len(f.Actors[row][col]) == 0
}

func (f *GameField) LinkActorToCells(obj gameObjectsBase.Activer) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    id := obj.GetID()
    f.Actors[ltr][ltc][id] = obj
    f.Actors[ltr][rbc][id] = obj
    f.Actors[rbr][rbc][id] = obj
    f.Actors[rbr][ltc][id] = obj
}

func (f *GameField) UnlinkActorFromCells(obj gameObjectsBase.Activer) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    id := obj.GetID()
    delete(f.Actors[ltr][ltc], id)
    delete(f.Actors[ltr][rbc], id)
    delete(f.Actors[rbr][rbc], id)
    delete(f.Actors[rbr][ltc], id)
}
