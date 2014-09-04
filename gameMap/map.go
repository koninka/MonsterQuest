package gameMap

import (
    "io/ioutil"
    "strings"
    "fmt"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
    projectilesModule "MonsterQuest/projectileManager/projectiles"
)

type fieldCell struct {
    background byte
    actors map[int64] gameObjectsBase.Activer
    items map[int64] gameObjectsBase.Itemer
    projectiles map[int64] projectilesModule.Projectiler
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
    } else if item, ok := obj.(gameObjectsBase.Itemer); ok {
        cell.items[item.GetID()] = item
    } else if projectile, ok := obj.(projectilesModule.Projectiler); ok {
        cell.projectiles[projectile.GetID()] = projectile
    } else {
        panic(fmt.Sprintf("Link to cell something wrong"))
    }
}

func (cell *fieldCell) unlink(obj gameObjectsBase.GameObjecter) {
    if actor, ok := obj.(gameObjectsBase.Activer); ok {
        delete(cell.actors, actor.GetID())
    } else if item, ok := obj.(gameObjectsBase.Itemer); ok {
        delete(cell.items, item.GetID())
    } else if projectile, ok := obj.(projectilesModule.Projectiler); ok {
        delete(cell.projectiles, projectile.GetID())
    } else {
        panic(fmt.Sprintf("Unlink from cell something wrong"))
    }
}

type GameField struct {
    Width, Height int
    Field [][]*fieldCell
    initialized bool
}

func newFieldCell(background byte) *fieldCell {
    return &fieldCell{background, make(map[int64] gameObjectsBase.Activer), make(map[int64] gameObjectsBase.Itemer), make(map[int64] projectilesModule.Projectiler)}
}

func NewGameField() GameField {
    return GameField{
        Field: make([][]*fieldCell, 1000),
    }
}

func (f *GameField) SetCell(x, y int, c byte) {
    f.Field[y][x].background = c
}

func (f *GameField) LoadFromStrings(strs []string) bool {
    for idx, str := range strs {
           if len(str) > 0 && rune(str[len(str) - 1]) == rune(13) {
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
        f.initialized = true
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
    if !f.OutOfRange(ltc, ltr) {
        f.Field[ltr][ltc].link(obj)
    }
    if !f.OutOfRange(rbc, ltr) {
        f.Field[ltr][rbc].link(obj)
    }
    if !f.OutOfRange(rbc, rbr) {
        f.Field[rbr][rbc].link(obj)
    }
    if !f.OutOfRange(ltc, rbr) {
        f.Field[rbr][ltc].link(obj)
    }
}

func (f *GameField) UnlinkFromCells(obj gameObjectsBase.GameObjecter) {
    r := obj.GetRectangle()
    ltc, ltr := int(r.LeftTop.X), int(r.LeftTop.Y)
    rbc, rbr := int(r.RightBottom.X), int(r.RightBottom.Y)
    if !f.OutOfRange(ltc, ltr) {
        f.Field[ltr][ltc].unlink(obj)
    }
    if !f.OutOfRange(rbc, ltr) {
        f.Field[ltr][rbc].unlink(obj)
    }
    if !f.OutOfRange(rbc, rbr) {
        f.Field[rbr][rbc].unlink(obj)
    }
    if !f.OutOfRange(ltc, rbr) {
        f.Field[rbr][ltc].unlink(obj)
    }
}

func (f *GameField) getSpace(coord, radiusVision, bound int) (v1 int, v2 int) {
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

func (f *GameField) GetSquareArea(x, y float64, boundSize int) (geometry.Point, geometry.Point) {
    l, r := f.getSpace(int(x), boundSize, f.Width - 1)
    t, b := f.getSpace(int(y), boundSize, f.Height - 1)
    return geometry.Point{ float64(l), float64(t) }, geometry.Point{ float64(r), float64(b) }
}

func (f *GameField) GetActors(col, row int) map[int64] gameObjectsBase.Activer {
    if f.OutOfRange(col, row) {
        return make(map[int64] gameObjectsBase.Activer)
    } else {
        return f.Field[row][col].actors
    }
}

func (f *GameField) GetObjects(col, row int) map[int64] gameObjectsBase.GameObjecter {
    objects := make(map[int64] gameObjectsBase.GameObjecter)
    if !f.OutOfRange(col, row) {
        for id, actor := range f.Field[row][col].actors {
            objects[id] = actor
        }
        for id, item := range f.Field[row][col].items {
            objects[id] = item
        }
        for id, projectile := range f.Field[row][col].projectiles {
            objects[id] = projectile
        }
    }
    return objects
}

func (f *GameField) GetBackground(col, row int) byte {
    return f.Field[row][col].background
}

func (f *GameField) GetCellRectangle(col, row int) *geometry.Rectangle {
    return geometry.MakeRectangle(geometry.MakePoint(float64(col), float64(row)), geometry.MakePoint(float64(col + 1), float64(row + 1)))
}

func (f *GameField) FreeForObject(x, y float64) bool {
    tl := geometry.MakePoint(x - consts.OBJECT_HALF, y - consts.OBJECT_HALF)
    br := geometry.MakePoint(x + consts.OBJECT_HALF, y + consts.OBJECT_HALF)
    tr := geometry.MakePoint(x + consts.OBJECT_HALF, y - consts.OBJECT_HALF)
    bl := geometry.MakePoint(x - consts.OBJECT_HALF, y + consts.OBJECT_HALF)
    rect := geometry.MakeRectangle(tl, br)
    var pts = []*geometry.Point { tl, br, bl, tr }
    blockeds := make([]*geometry.Rectangle, 0, 100)
    for _, point := range pts {
        col, row := int(point.X), int(point.Y)
       if f.IsBlocked(col, row) {
            blockeds = append(blockeds, f.GetCellRectangle(col, row))
       }
    }
    for _, blocked := range blockeds {
        if rect.CrossedByRect(blocked) {
            return false
        }
    }
    for _, point := range pts {
        for _, actor := range f.GetActors(int(point.X), int(point.Y)) {
            r := actor.GetRectangle()
            if rect.CrossedByRect(&r) {
                return false
            }
        }
    }
    return true
}

func (f *GameField) Clear() {
    f.Field = make([][]*fieldCell, 1000)
    f.Width, f.Height = 0, 0
    f.initialized = false
}

func (f *GameField) Initialized() bool {
    return f.initialized
}