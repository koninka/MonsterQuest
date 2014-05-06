package gameObjectsBase

import (
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

type GameObjecter interface {
    GetID() int64
    SetID(id int64)
    GetCenter() geometry.Point
    GetRectangle() geometry.Rectangle
    ForcePlace(point geometry.Point)
    GetType() string
    GetInfo() consts.JsonType
}

type GameObject struct {
    Id int64
    Center geometry.Point
}

func (obj *GameObject) GetID() int64 {
    return obj.Id
}

func (obj *GameObject) SetID(id int64) {
    obj.Id = id
}

func (obj *GameObject) GetCenter() geometry.Point {
    return obj.Center
}

func (obj *GameObject) GetRectangle() geometry.Rectangle {
    lt := obj.Center
    rb := lt
    lt.Move(-consts.OBJECT_HALF, -consts.OBJECT_HALF)
    rb.Move(consts.OBJECT_HALF, consts.OBJECT_HALF)
    return geometry.Rectangle{lt, rb}
}

func (obj *GameObject) ForcePlace(point geometry.Point) {
    obj.Center = point
}

func (obj *GameObject) GetType() string {
    return ""
}

func (obj *GameObject) GetInfo() consts.JsonType {
    return make(map[string] interface{})
}

func NewGameObject(id int64, point geometry.Point) GameObject {
    return GameObject{id, point}
}