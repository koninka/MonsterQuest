package gameObjectsBase

import (
    "MonsterQuest/gameFight/fightBase"
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
    GetSymbol() string
    CreateDropCount() int
}

type Activer interface {
    GameObjecter
    GetShiftedFrontSide(int) geometry.Point
    GetCollisionableSide(int) (geometry.Segment, geometry.Point)
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
    GetMaxHP() int
    GetAttackRadius() int
    NotifyAboutCollision()
    GetKind() Kinder
    GetHit(fightBase.Blower, Activer) consts.JsonType
    Killed() bool
    ReadyAttack() bool
    IncCooldownCounter()
    ZeroCooldown()
    SetAttackPoint(x, y float64)
    GetAttackPoint() *geometry.Point
    ClearAttackPoint()
    GetItems() map[int64] *Item
    AddItem(item *Item)
}

/*==========STRUCTS AND IMPLEMENTATION==============*/

type Kind struct {
    symbol string
    Race int
    Flags []Flager
}

func (k* Kind) GetSymbol() string {
    return k.symbol
}

func (k *Kind) GetRace() int {
    return k.Race
}

func (k* Kind) SetRace(race int) {
    k.Race = race
}

func (k *Kind) GetFlags() *[]Flager {
    return &k.Flags
}

func (k *Kind) AddFlag(flag Flager) {
    k.Flags = append(k.Flags, flag)
}

func (k *Kind) CreateDropCount() int {
    return 0
}

func NewKind(symbol string) Kind {
    return Kind{symbol, consts.NO_RACE, make([]Flager, 0, 1000)}
}

type ActiveObject struct {
    GameObject
    Dir int
    HP int
    MaxHP int
    AttackCooldownCounter int
    Target Activer
    Kind Kinder
    AttackPoint *geometry.Point
    Inventory *InventoryObj
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
    if obj.Target != nil && obj.Target.Killed() {
        obj.Target = nil
    }
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

func (obj *ActiveObject) GetMaxHP() int {
    return obj.MaxHP
}

func (obj *ActiveObject) GetAttackRadius() int {
    return 0
}

func (obj *ActiveObject) NotifyAboutCollision() {}


func (obj *ActiveObject) GetKind() Kinder {
    return obj.Kind
}

func (obj *ActiveObject) GetHit(blow fightBase.Blower, attacker Activer) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "attack"
    res["description"] = consts.JsonType {
        "blowType" : blow.GetType(),
        "dealtDamage" : blow.GetDamage(),
    }
    obj.HP -= blow.GetDamage()
    if obj.HP <= 0 {
        res["killed"] = true
    }
    return res
}

func (obj *ActiveObject) Killed() bool {
    return obj.HP <= 0
}

func (obj *ActiveObject) ReadyAttack() bool {
    return obj.AttackCooldownCounter == consts.DEFAULT_ATTACK_COOLDOWN
}

func (obj *ActiveObject) IncCooldownCounter() {
    if obj.AttackCooldownCounter < consts.DEFAULT_ATTACK_COOLDOWN {
        obj.AttackCooldownCounter++
    }
}

func (obj *ActiveObject) ZeroCooldown() {
    obj.AttackCooldownCounter = 0
}

func (obj *ActiveObject) SetAttackPoint(x, y float64) {
    obj.AttackPoint = geometry.MakePoint(x, y)
}

func (obj *ActiveObject) GetAttackPoint() *geometry.Point {
    return obj.AttackPoint
}

func (obj *ActiveObject) ClearAttackPoint() {
    obj.AttackPoint = nil
}

func (obj *ActiveObject) MoveItem(item *Item, cell int64){
    if obj.Inventory.CellIsEmpty(cell){
        item.SetCell(cell)
    }
}

func (obj *ActiveObject) AddItem(item *Item) {
    obj.Inventory.Items[item.GetID()] = item
    cell := obj.Inventory.FindEmptyCell()
    item.SetCell(cell)
}

func (obj *ActiveObject) DropItem(item *Item) {
    delete(obj.Inventory.Items, item.GetID())
}

func (obj *ActiveObject) GetItems() map[int64] *Item {
    return obj.Inventory.Items
}

func (obj *ActiveObject) GetInfo() consts.JsonType {
    info := obj.GameObject.GetInfo()
    info["hp"] = obj.HP
    info["max_hp"] = obj.MaxHP
    info["symbol"] = obj.Kind.GetSymbol()
    return info
}

func NewActiveObject(id int64, hp int, x, y float64, kind Kinder) ActiveObject {
    return ActiveObject{NewGameObject(id, geometry.Point{x, y}), -1, hp, hp, consts.DEFAULT_ATTACK_COOLDOWN, nil, kind, nil, NewInventoryObj()}
}
