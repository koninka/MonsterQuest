package gameMap

import (
    "io/ioutil"
    "strings"
    "fmt"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
)

type fieldCell struct {
    background byte
    actors map[int64] gameObjectsBase.Activer
    items map[int64] *gameObjectsBase.Item
}

func (cell *fieldCell) isBlocked() bool {
    return cell.background == '#'
}

func (cell *fieldCell) isFree() bool {
    return len(cell.actors) == 0
}

func (cell *fieldCell) link(obj gameObjectsBase.GameObjecter) {
    if actor, ok := obj.(gameObjectsBase.Activer); ok {
        cell.actors[actor.GetID()] = actor
    } else if item, ok := obj.(*gameObjectsBase.Item); ok {
        cell.items[item.GetID()] = item
    } else {
        panic(fmt.Sprintf("Link to cell something wrong"))
    }
}

func (cell *fieldCell) unlink(obj gameObjectsBase.GameObjecter) {
    if actor, ok := obj.(gameObjectsBase.Activer); ok {
        delete(cell.actors, actor.GetID())
    } else if item, ok := obj.(*gameObjectsBase.Item); ok {
        delete(cell.items, item.GetID())
    } else {
        panic(fmt.Sprintf("Unlink from cell something wrong"))
    }
}

type GameField struct {
    Width, Height int
    Field [][]*fieldCell
}

func newFieldCell(background byte) *fieldCell {
    return &fieldCell{background, make(map[int64] gameObjectsBase.Activer), make(map[int64] *gameObjectsBase.Item)}
}

func NewGameField() GameField {
    field := GameField{
        Field: make([][]*fieldCell, 1000),
    }
    return field
}

func (f *GameField) SetCell(x, y int, c byte) {
    f.Field[y][x].background = c
}

func (f *GameField) LoadFromStrings(strs []string) bool {
    for idx, str := range strs {
           if rune(str[len(str) - 1]) == rune(13) {
                strs[idx] = str[:len(str) - 1]
           }
    }
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
        f.Width = len(strs[0])
        f.Height = len(strs)
    }
    if correct {
        for idx, str := range strs {
           f.Field[idx] = make([]*fieldCell, 1000)
           for i, b := range str {
                f.Field[idx][i] = newFieldCell(byte(b))
           }
        }
    }
    return correct
}

func (f *GameField) LoadFromFile(mapFile string) {
    content, err := ioutil.ReadFile(consts.PATH_TO_MAPS + mapFile)
    strs := strings.Split(string(content), "\n")
    if err != nil || !f.LoadFromStrings(strs) {
        panic(fmt.Sprintf("Load map from file %s failed", mapFile))
    }
}

func (f *GameField) OutOfRange(col, row int) bool {
    return col < 0 || col >= f.Width || row < 0 || row >= f.Height
}

func (f *GameField) IsBlocked(col, row int) bool {
    return f.OutOfRange(col, row) || f.Field[row][col].isBlocked()
}

func (f *GameField) IsFree(col, row int) bool {
    return !f.IsBlocked(col, row) && f.Field[row][col].isFree()
}

func (f *GameField) LinkToCells(obj gameObjectsBase.GameObjecter) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    f.Field[ltr][ltc].link(obj)
    f.Field[ltr][rbc].link(obj)
    f.Field[rbr][rbc].link(obj)
    f.Field[rbr][ltc].link(obj)
}

func (f *GameField) UnlinkFromCells(obj gameObjectsBase.GameObjecter) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    f.Field[ltr][ltc].unlink(obj)
    f.Field[ltr][rbc].unlink(obj)
    f.Field[rbr][rbc].unlink(obj)
    f.Field[rbr][ltc].unlink(obj)
}

func (f *GameField) getVisibleSpace(coord, radiusVision, bound int) (v1 int, v2 int) {
    r := radiusVision + 1
    if coord - r < 0 {
        v1 = 0
    } else {
        v1 = coord - r
    }
    if coord + r > bound {
        v2 = bound
    } else {
        v2 = coord + r
    }
    return
}

func (f *GameField) GetVisibleArea(x, y float64, radiusVision int) (geometry.Point, geometry.Point) {
    l, r := f.getVisibleSpace(int(x), radiusVision, f.Width - 1)
    t, b := f.getVisibleSpace(int(y), radiusVision, f.Height - 1)
    return geometry.Point{float64(l), float64(t)}, geometry.Point{float64(r), float64(b)}
}

func (f *GameField) GetActors(col, row int) map[int64] gameObjectsBase.Activer {
    if f.OutOfRange(col, row) {
        return make(map[int64] gameObjectsBase.Activer)
    } else {
        return f.Field[row][col].actors
    }
}

func (f *GameField) GetObjects(col, row int) map[int64] gameObjectsBase.GameObjecter {
    if f.OutOfRange(col, row) {
        return make(map[int64] gameObjectsBase.GameObjecter)
    } else {
        objects := make(map[int64] gameObjectsBase.GameObjecter)
        for id, actor := range f.Field[row][col].actors {
            objects[id] = actor
        }
        for id, item := range f.Field[row][col].items {
            objects[id] = item
        }
        return objects
    }
}

func (f *GameField) GetBackground(col, row int) byte {
    return f.Field[row][col].background
}
