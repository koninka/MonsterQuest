package gameObjectsBase

import (
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

func GetShiftByDirection(dir int) (mx int, my int) {
    switch dir {
    case consts.NORTH_DIR: mx, my = 0, -1
    case consts.SOUTH_DIR: mx, my = 0, 1
    case consts.EAST_DIR:  mx, my = 1, 0
    case consts.WEST_DIR:  mx, my = -1, 0
    }
    return
}

type Flager interface {
    Do(obj Activer)
}

type Activer interface {
    GetID() int64
    GetCenter() geometry.Point
    GetRectangle() geometry.Rectangle
    GetShiftedFrontSide(dir int) geometry.Point
    GetCollisionableSide(dir int) (geometry.Segment, geometry.Point)
    ForcePlace(point geometry.Point)
    GetType() string
    GetInfo() map[string] interface{}
    GetDir() int
    GetBehaviors() *[] Flager
}

type ActiveObject struct {
    Id int64
    Dir int
    Center geometry.Point
    Behaviors []Flager
}

func (obj *ActiveObject) GetID() int64 {
    return obj.Id
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

func (obj *ActiveObject) GetShiftedCenter(dir int) geometry.Point {
    mx, my := GetShiftByDirection(dir)
    point := obj.Center
    point.Move(float64(mx) * consts.VELOCITY, float64(my) * consts.VELOCITY)
    return point
}

func (obj *ActiveObject) GetShiftedFrontSide(dir int) geometry.Point{
    mx, my := GetShiftByDirection(dir)
    point := obj.Center
    point.Move(float64(mx) * (consts.OBJECT_HALF + consts.VELOCITY), float64(my) * (consts.OBJECT_HALF + consts.VELOCITY))
    return point;
}

func (obj *ActiveObject) Move(dir int) {
    obj.Center = obj.GetShiftedCenter(dir)
}

func (obj *ActiveObject) ForcePlace(point geometry.Point) {
    obj.Center = point
}

func (obj *ActiveObject) GetType() string {
    return ""
}

func (obj *ActiveObject) GetInfo() map[string] interface{} {
    return make(map[string] interface{})
}

func (obj *ActiveObject) GetCollisionableSide(dir int) (geometry.Segment, geometry.Point) {
    var p1, p2, p3 geometry.Point
    p1 = obj.GetShiftedCenter(dir)
    p2 = p1
    p3 = p1
    switch dir {
        case consts.NORTH_DIR: 
            p1.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, -consts.OBJECT_HALF)
        case consts.SOUTH_DIR:
            p1.Move(-consts.OBJECT_HALF, consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
        case consts.EAST_DIR:
            p1.Move(consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
        case consts.WEST_DIR:
            p1.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
            p2.Move(-consts.OBJECT_HALF, consts.OBJECT_HALF)
    }
    return geometry.Segment{p1, p2}, p3
}

func (obj *ActiveObject) GetDir() int {
    return obj.Dir
}

func (obj *ActiveObject) GetBehaviors() *[]Flager {
    return &obj.Behaviors
}