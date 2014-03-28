package gameObjects

import (
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

func GetShiftByDirection(dir string) (mx int, my int) {
    switch dir {
    case "north": mx, my = 0, -1
    case "south": mx, my = 0, 1
    case "east":  mx, my = 1, 0
    case "west":  mx, my = -1, 0
    }
    return
}

type Activer interface {
    GetID() int64
    GetCenter() geometry.Point
    GetRectangle() geometry.Rectangle
    GetShiftedFrontSide(dir string) geometry.Point
    GetCollisionableSide(dir string) (geometry.Segment, geometry.Point)
    ForcePlace(point geometry.Point)
    GetType() string
}

type ActiveObject struct {
    id int64
    Center geometry.Point
}

func (obj *ActiveObject) GetID() int64 {
    return obj.id
}

func (obj *ActiveObject) GetCenter() geometry.Point {
    return obj.Center
}

func (obj *ActiveObject) GetRectangle() geometry.Rectangle {
    lt := obj.Center
    rb := lt
    lt.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
    rb.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
    return geometry.Rectangle{lt, rb}
}

func (obj *ActiveObject) GetShiftedCenter(dir string) geometry.Point {
    mx, my := GetShiftByDirection(dir)
    point := obj.Center
    point.Move(float64(mx) * consts.VELOCITY, float64(my) * consts.VELOCITY)
    return point
}

func (obj *ActiveObject) GetShiftedFrontSide(dir string) geometry.Point{
    mx, my := GetShiftByDirection(dir)
    point := obj.Center
    point.Move(float64(mx) * (consts.OBJECT_HALF + consts.VELOCITY), float64(my) * (consts.OBJECT_HALF + consts.VELOCITY))
    return point;
}

func (obj *ActiveObject) Move(dir string) {
    obj.Center = obj.GetShiftedCenter(dir)
}

func (obj *ActiveObject) ForcePlace(point geometry.Point) {
    obj.Center = point
}

func (obj *ActiveObject) GetType() string {
    return ""
}

func (obj *ActiveObject) GetCollisionableSide(dir string) (geometry.Segment, geometry.Point) {
    var p1, p2, p3 geometry.Point
    p1 = obj.GetShiftedCenter(dir)
    p2 = p1
    p3 = p1
    switch dir {
        case "north": 
            p1.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, -consts.OBJECT_HALF)
        case "south":
            p1.Move(-consts.OBJECT_HALF, consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
        case "east":
            p1.Move(consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
        case "west":
            p1.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(-consts.OBJECT_HALF, consts.OBJECT_HALF)
    }
    return geometry.Segment{p1, p2}, p3
}

