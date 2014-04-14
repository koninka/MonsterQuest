package gameObjectsBase

import (
    _ "fmt"
    "MonsterQuest/gameFight/blowList"
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


/*=================INTERFACES======================*/

type Flager interface {
    Do(obj Activer)
}

type Kinder interface {
    GetRace() int
    GetFlags() *[]Flager
    GetName() string
    GetDescription() string
    AddFlag(Flager)
}

type Activer interface {
    GetID() int64
    SetID(id int64)
    GetCenter() geometry.Point
    GetRectangle() geometry.Rectangle
    GetShiftedFrontSide(int) geometry.Point
    GetCollisionableSide(int) (geometry.Segment, geometry.Point)
    ForcePlace(point geometry.Point)
    GetType() string
    GetInfo() map[string] interface{}
    GetDir() int
    SetDir(dir int)
    Init()
    DoWithObj(Activer)
    Do()
    Attack() consts.JsonType
    GetTarget() (Activer, bool)
    SetTarget(Activer)
    GetRadiusVision() int
    GetDealtDamage() int
    GetHP() int
    GetAttackRadius() int
    NotifyAboutCollision()
    GetKind() Kinder
    GetHit(*blowList.BlowDescription, Activer) consts.JsonType
}

/*==========STRUCTS AND IMPLEMENTATION==============*/

type Kind struct {
    Race int
    Flags []Flager
}

func (k *Kind) GetRace() int {
    return k.Race
}

func (k *Kind) GetFlags() *[]Flager {
    return &k.Flags
}

func (k *Kind) AddFlag(flag Flager) {
    k.Flags = append(k.Flags, flag)
}

func NewKind(race int) Kind {
    return Kind{race, make([]Flager, 0, 1000)}
}

type ActiveObject struct {
    Id int64
    Dir int
    HP int
    Center geometry.Point
    Target Activer
    Kind Kinder
}

func (obj *ActiveObject) GetID() int64 {
    return obj.Id
}

func (obj *ActiveObject) SetID(id int64) {
    obj.Id = id
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

func (obj *ActiveObject) SetDir(dir int) {
    obj.Dir = dir
}

func (obj *ActiveObject) GetFlags() *[]Flager {
    return obj.GetKind().GetFlags()
}

func (obj *ActiveObject) Init() {}

func (obj *ActiveObject) Do() {
    obj.DoWithObj(obj)
}

func (obj *ActiveObject) DoWithObj(object Activer) {
    for _, f := range *obj.GetKind().GetFlags() {
        f.Do(object)
    }
}

func (obj *ActiveObject) Attack() consts.JsonType {
    return nil
}

func (obj *ActiveObject) GetTarget() (Activer, bool) {
    return obj.Target, obj.Target != nil
}

func (obj *ActiveObject) SetTarget(target Activer) {
    obj.Target = target
}

func (obj *ActiveObject) GetRadiusVision() int {
    return consts.VISION_RADIUS
}

func (obj *ActiveObject) GetDealtDamage() int {
    return 0
}

func (obj *ActiveObject) GetHP() int {
    return obj.HP
}

func (obj *ActiveObject) GetAttackRadius() int {
    return 0
}

func (obj *ActiveObject) NotifyAboutCollision() {}


func (obj *ActiveObject) GetKind() Kinder {
    return obj.Kind
}

func (obj *ActiveObject) GetHit(bldesc *blowList.BlowDescription, attacker Activer) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "attack"
    res["blowType"] = bldesc.GetBlowType()
    res["dealtDamage"] = bldesc.DmgDesc.GetDamage()
    obj.HP -= res["dealtDamage"].(int)
    //use damage effect
    return res
}

func NewActiveObject(id int64, x, y float64, kind Kinder) ActiveObject {
    return ActiveObject{id, -1, 0, geometry.Point{x, y}, nil, kind}
}
