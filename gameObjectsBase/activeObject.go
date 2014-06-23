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
    GetItems() map[int64] Itemer
    AddItem(Itemer) int
    DropItem(Itemer, int) (int, Itemer)
    GetCharacteristic(charIota int) int
    SetCharacteristic(charIota, newVal int)
    ModifyCharacteristic(charIota, val int)
    ModifyBonus(charIota, val int)
    MergeInfo(consts.JsonType) consts.JsonType
}

/*==========STRUCTS AND IMPLEMENTATION==============*/

type Kind struct {
    Race int
    Flags []Flager
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

func NewKind() Kind {
    return Kind{consts.NO_RACE, make([]Flager, 0, 1000)}
}

type ActiveObject struct {
    GameObject
    Dir int
    HP int
    MP int
    AttackCooldownCounter int
    Target Activer
    Kind Kinder
    AttackPoint *geometry.Point
    Inventory *InventoryObj
    Characteristics map[int] int
    Bonuses map[int] int
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
    return obj.Characteristics[consts.CHARACTERISTIC_HP]
}

func (obj *ActiveObject) GetMP() int {
    return obj.MP
}

func (obj *ActiveObject) GetMaxMP() int {
    return obj.Characteristics[consts.CHARACTERISTIC_MP]
}

func (obj *ActiveObject) GetAttackRadius() int {
    return 0
}

func (obj *ActiveObject) NotifyAboutCollision() {}


func (obj *ActiveObject) GetKind() Kinder {
    return obj.Kind
}

func (obj *ActiveObject) GetHit(blow fightBase.Blower, attacker Activer) consts.JsonType {
    var res = consts.JsonType { "action" : "attack" }
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

func (obj *ActiveObject) AddItem(item Itemer) int {
    return obj.Inventory.AddItem(item, obj)
}

func (obj *ActiveObject) DropItem(item Itemer, amount int) (int, Itemer) {
    return obj.Inventory.DropItem(item, amount)
}

func (obj *ActiveObject) GetItems() map[int64] Itemer {
    return obj.Inventory.Items
}

func (obj *ActiveObject) GetInfo() consts.JsonType {
    info := obj.GameObject.GetInfo()
    info["hp"] = obj.HP
    info["max_hp"] = obj.Characteristics[consts.CHARACTERISTIC_HP]
    info["mp"] = obj.MP
    info["max_mp"] = obj.Characteristics[consts.CHARACTERISTIC_MP]
    return info
}

func (obj *ActiveObject) GetFullInfo() consts.JsonType {
    info := make(consts.JsonType)
    characteristics := make(consts.JsonType)
    for c, v := range obj.Characteristics {
        characteristics[consts.CharacteristicNameMapping[c]] = v
    }
    info["characteristics"] = characteristics
    return info
}

func (obj *ActiveObject) GetCharacteristic(charIota int) int {
    return obj.Characteristics[charIota]
}

func (obj *ActiveObject) SetCharacteristic(charIota int, newVal int) {
    obj.Characteristics[charIota] = newVal
}

func (obj *ActiveObject) modifyInRange(charIota int, val, maxVal int) {
    cVal := obj.GetCharacteristic(charIota)
    if cVal + val >= maxVal {
        obj.SetCharacteristic(charIota, maxVal)
    } else {
        obj.SetCharacteristic(charIota, cVal + val)
    }
}

func (obj *ActiveObject) ModifyCharacteristic(charIota int, val int) {
    if charIota == consts.CHARACTERISTIC_HP {
        obj.modifyInRange(charIota, val, obj.GetMaxHP())
    } else if charIota == consts.CHARACTERISTIC_MP {
        obj.modifyInRange(charIota, val, obj.GetMaxMP())
    } else {
        obj.Characteristics[charIota] += val
    }
}

func (obj *ActiveObject) ModifyBonus(charIota, val int) {
    obj.Bonuses[charIota] += val
}

func (obj* ActiveObject) MergeInfo(info consts.JsonType) consts.JsonType {
    for k, v := range obj.GetFullInfo() {
        info[k] = v
    }
    return info
}

func newCharacteristicsMap() map[int] int {
    characteristics := make(map[int] int)
    for i := 0; i < consts.CHARACTERISTICS_COUNT; i++ {
        characteristics[i] = consts.CharacteristicDefaultValueMapping[i]
    }
    return characteristics
}

func newBonusMap() map[int] int {
    bonuses := make(map[int] int)
    for i := 0; i < consts.CHARACTERISTICS_COUNT; i++ {
        bonuses[i] = 0.0
    }
    return bonuses
}

func NewActiveObject(id int64, hp, mp int, x, y float64, kind Kinder) ActiveObject {
    return ActiveObject{NewGameObject(id, geometry.Point{x, y}), -1, hp, mp, consts.DEFAULT_ATTACK_COOLDOWN, nil, kind, nil,
        NewInventoryObj(), newCharacteristicsMap(), newBonusMap()}
}
