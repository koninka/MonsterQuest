package gameObjectsBase

import (
    "time"
    "strings"
    "MonsterQuest/utils"
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    "MonsterQuest/gameFight/fightBase"
)

type Bonus struct {
    characteristic int
    effectCalculation int
    val int
}

func (b *Bonus) calcActualValue(owner Activer) int {
    bonusVal := b.val
    if b.effectCalculation == consts.BONUS_PERCENT {
        bonusVal = int(owner.GetCharacteristic(b.characteristic) * b.val / 100.0)
    }
    return bonusVal
}

func (b *Bonus) apply(owner Activer) {
    owner.ModifyBonus(b.characteristic, b.calcActualValue(owner))
}

func (b *Bonus) cancel(owner Activer) {
    owner.ModifyBonus(b.characteristic, - b.calcActualValue(owner))
}

func (b *Bonus) GetFullInfo() consts.JsonType {
    bonusInfo := make(consts.JsonType)
    bonusInfo["characteristic"] = consts.CharacteristicNameMapping[b.characteristic]
    bonusInfo["val"] = b.val
    if b.effectCalculation == consts.BONUS_PERCENT {
        bonusInfo["percent"] = true
    }
    return bonusInfo
}

func NewBonus(characteristic, effectCalculation, val int) *Bonus {
    return &Bonus{characteristic, effectCalculation, val}
}

func BonusFromJson(bonusDesc consts.JsonType) *Bonus {
    var requiredFields = map[string] string {
        "stat" : "badItem",
        "effectCalculation" : "badItem",
        "value" : "badItem",
    }
    if ok, _ := utils.CheckJsonRequest(bonusDesc, requiredFields); ok {
        statParam, ok1 := bonusDesc["stat"].(string)
        effectCalculationParam, ok2 := bonusDesc["effectCalculation"].(string)
        val, ok3 := bonusDesc["value"].(float64)
        if ok1 && ok2 && ok3 {
            return NewBonus(consts.NameCharacteristicMapping[statParam], consts.NameBonusMapping[effectCalculationParam], int(val))
        }
    }
    return nil
}

type Effecter interface {
    apply(activator Activer)
    GetFullInfo() consts.JsonType
}

type Effect struct {
    duration time.Duration
}

func (e *Effect) GetFullInfo() consts.JsonType {
    return consts.JsonType { "duration" : e.duration }
}

type OnGoingEffect struct {
    Effect
    characteristic int
    val int
}

func (me *OnGoingEffect) apply(activator Activer) {
    dc := int(float64(me.val) / float64(me.duration))
    start := time.Now()
    for time.Since(start) < me.duration {
        activator.ModifyCharacteristic(me.characteristic, dc)
        time.Sleep(time.Second)
    }
}

func (me *OnGoingEffect) GetFullInfo() consts.JsonType {
    res := me.Effect.GetFullInfo()
    res["characteristic"] = consts.CharacteristicNameMapping[me.characteristic]
    res["val"] = me.val
    return res
}

func onGoingEffectFromJson(effectDesc consts.JsonType) *OnGoingEffect {
    var res *OnGoingEffect
    errorMsg := "badItem"
    var requiredFields = map[string] string {
        "stat" : errorMsg,
        "duration" : errorMsg,
        "value" : errorMsg,
    }
    if ok, _ := utils.CheckJsonRequest(effectDesc, requiredFields); ok {
        stat, ok1 := effectDesc["stat"].(string)
        duration, ok2 := effectDesc["duration"].(int)
        value, ok3 := effectDesc["value"].(int)
        if ok1 && ok2 && ok3 {
            res = newOnGoingEffect(time.Duration(duration), consts.NameCharacteristicMapping[stat], value)
        }
    }
    return res
}

type BonusEffect struct {
    Effect
    Bonus
}

func (be *BonusEffect) apply(activator Activer) {
    be.Bonus.apply(activator)
    time.Sleep(be.duration)
    be.Bonus.cancel(activator)
}

func (be *BonusEffect) GetFullInfo() consts.JsonType {
    res := be.Effect.GetFullInfo()
    res["bonus"] = be.Bonus.GetFullInfo()
    return res
}

func bonusEffectFromJson(effectDesc consts.JsonType) *BonusEffect {
    var res *BonusEffect
    errorMsg := "badItem"
    var requiredFields = map[string] string {
        "duration" : errorMsg,
        "bonus" : errorMsg,
    }
    if ok, _ := utils.CheckJsonRequest(effectDesc, requiredFields); ok {
        duration, ok1 := effectDesc["duration"].(int)
        bonusDesc, ok2 := effectDesc["bonus"].(map[string] interface{})
        if ok1 && ok2 {
            res = newBonusEffect(time.Duration(duration), BonusFromJson(bonusDesc))
        }
    }
    return res
}

func EffectFromJson(effectDesc consts.JsonType) Effecter {
    var res Effecter
    effectType, ok := effectDesc["type"].(string)
    if ok {
        if effectType == "bonus" {
            res = bonusEffectFromJson(effectDesc)
        } else if effectType == "ongoing" {
            res = onGoingEffectFromJson(effectDesc)
        }
    }
    return res
}

func newOnGoingEffect(duration time.Duration, characteristic, val int) *OnGoingEffect {
    return &OnGoingEffect{Effect{duration}, characteristic, val}
}

func newBonusEffect(duration time.Duration, bonus *Bonus) *BonusEffect {
    return &BonusEffect{Effect{duration}, *bonus}
}

type ItemKind struct {
    dbId int64
    name string
    weight int
    power string
    message string
    description string
    class int
    itemType int
    subtype int
    bonuses [] *Bonus
    effects [] Effecter
}

type gameItemGen struct {
    item_kind *ItemKind
    probability int
}

func (gigi* gameItemGen) Probability() int {
    return gigi.probability
}

func (gigi* gameItemGen) GenItem(owner Activer) Itemer {
    var amount int = 1
    if gigi.item_kind.class == consts.ITEM_CLASS_CONSUMABLE || gigi.item_kind.itemType == consts.ITEM_T_EXPENDABLE {
        amount = utils.Randint0(150) + 1
    }
    return newItem(gigi.item_kind, owner, amount)
}

type gameItemsList struct {
    items map[int64] *ItemKind
    items_depth_gen map[int64] []*gameItemGen
}

var gameItems *gameItemsList = &gameItemsList{make(map[int64] *ItemKind), make(map[int64] []*gameItemGen)}

func ItemGens(depth int64) (*[]*gameItemGen, bool) {
    gens, has_gen := gameItems.items_depth_gen[depth];
    return &gens, has_gen
}

var BDString2IotaCharacteristic = map[string] int {
    "STR"   : consts.CHARACTERISTIC_STRENGTH,
    "INT"   : consts.CHARACTERISTIC_INTELLEGENCE,
    "DEX"   : consts.CHARACTERISTIC_DEXTERITY,
    "CON"   : consts.CHARACTERISTIC_DEFENSE,
    "SPEED" : consts.CHARACTERISTIC_SPEED,
    "RES"   : consts.CHARACTERISTIC_MAGICK_RESISTANCE,
    "HP"    : consts.CHARACTERISTIC_HP,
    "MP"    : consts.CHARACTERISTIC_MP,
}

func parseBonusFromDB(bonusStr string) [] *Bonus {
    bonuses := make([] *Bonus, 0, 30)
    parts := strings.Split(bonusStr, ":")
    val := utils.ParseInt(parts[0])
    for _, c := range strings.Split(parts[1], "|") {
        bonuses = append(bonuses, NewBonus(BDString2IotaCharacteristic[c], consts.BONUS_CONSTANT, val))
    }
    return bonuses
}

func parseEffectFromDB(effectStr string) [] Effecter {
    effects := make([] Effecter, 0, 30)
    parts := strings.Split(effectStr, ":")
    duration := time.Duration(utils.ParseInt(parts[3]))
    characteristics := strings.Split(parts[1], "|")
    if parts[0] == "M" {
        val := utils.ParseInt(parts[2])
        for _, c := range characteristics {
            effects = append(effects, newOnGoingEffect(duration, BDString2IotaCharacteristic[c], val))
        }
    } else {
        bonusType := consts.BONUS_CONSTANT
        if last := len(parts[1]) - 1; parts[1][last] == '%' {
            bonusType = consts.BONUS_PERCENT
            parts[1] = parts[1][:last - 1]
        }
        val := utils.ParseInt(parts[1])
        for _, c := range characteristics {
            effects = append(effects, newBonusEffect(duration, NewBonus(BDString2IotaCharacteristic[c], bonusType, val)))
        }
    }
    return effects
}

func InitGameItems() {
    db := connect.CreateConnect()
    rows, _ := db.Query("SELECT id, name, atype, weight, allocation_info, power_info, message, description, bonus, effects FROM artifacts")
    for rows.Next() {
        var (
            id int64
            weight int
            atype_str, name, alloc_info_str, power_info_str, msg, desc, bonusesStr, effectsStr, power string
        )
        rows.Scan(&id, &name, &atype_str, &weight, &alloc_info_str, &power_info_str, &msg, &desc, &bonusesStr, &effectsStr)
        atype := strings.Split(atype_str, ":")
        power_arry := strings.Split(power_info_str, ":")
        if len(power_arry) > 1 {
            power = power_arry[1]
        }
        gameItems.items[id] = &ItemKind{id, name, weight, power, msg, desc, utils.ParseInt(atype[0]), utils.ParseInt(atype[1]), utils.ParseInt(atype[2]), make([] *Bonus, 0, 30), make([] Effecter, 0, 30)}
        alloc_info := strings.Split(alloc_info_str, ":");
        prob := utils.ParseInt(alloc_info[0])
        min_d := utils.ParseInt64(alloc_info[1]) - 1
        max_d := utils.ParseInt64(alloc_info[2]) - 1
        for i := min_d; i <= max_d; i++ {
            gameItems.items_depth_gen[i] = append(gameItems.items_depth_gen[i], &gameItemGen{gameItems.items[id], prob})
        }
        if len(bonusesStr) > 0 {
            for _, bonusStr := range strings.Split(bonusesStr, "@") {
                for _, bonus := range parseBonusFromDB(bonusStr) {
                    gameItems.items[id].bonuses = append(gameItems.items[id].bonuses, bonus)
                }
            }
        }
        if len(effectsStr) > 0 {
            for _, effectStr := range strings.Split(effectsStr, "@") {
                for _, effect := range parseEffectFromDB(effectStr) {
                    gameItems.items[id].effects = append(gameItems.items[id].effects, effect)
                }
            }
        }
    }
}

var IotaItemType2Name = map[int] string {
    consts.ITEM_T_AMULET     : "amulet",
    consts.ITEM_T_RING       : "ring",
    consts.ITEM_T_ARMOR      : "armor",
    consts.ITEM_T_SHIELD     : "shield",
    consts.ITEM_T_HELMET     : "helmet",
    consts.ITEM_T_GLOVES     : "gloves",
    consts.ITEM_T_BOOTS      : "boots",
    consts.ITEM_T_WEAPON     : "weapon",
    consts.ITEM_T_EXPENDABLE : "expendable",
}

var IotaItemSubType2Name = map[int] string {
    consts.ITEM_ST_ONE_HANDED : "one-handed",
    consts.ITEM_ST_TWO_HANDED : "two-handed",
    consts.ITEM_ST_BOW : "bow",
}

type Itemer interface {
    GameObjecter
    GetOwner() Activer
    SetOwner(Activer)
    IsOwner(Activer) bool
    SetPosition(geometry.Point)
    IsHeapItem() bool
    IsEquipped() bool
    IsWeapon() bool
    GetKind() *ItemKind
    GetKindId() int64
    HasOwner() bool
    GetWeight() int
    GetItemType() int
    GetAmount() int
    GetItemClass() int
    GetItemSubtype() int
    DecAmount(int)
    setAmount(int)
    UseItem(*InventoryObj)
    UnuseItem()
    EquipItem(*InventoryObj) int
    UnequipItem(*InventoryObj) int
    applyBonuses()
    applyEffects()
    cancelBonuses()

}

type Item struct {
    GameObject
    kind *ItemKind
    owner Activer
}

func (i *Item) GetType() string {
    return consts.ITEM_TYPE
}

func (i *Item) GetInfo() consts.JsonType {
    msg := i.GameObject.GetInfo()
    msg["name"] = i.kind.name
    msg["itemType"] = IotaItemType2Name[i.kind.itemType]
    msg["type"] = consts.ITEM_TYPE
    msg["weight"] = i.kind.weight
    if i.IsWeapon(){
        msg["subtype"] = IotaItemSubType2Name[i.kind.subtype]
    }
    return msg
}

func (i *Item) GetFullInfo() consts.JsonType {
    msg := i.GetInfo()
    msg["description"] = i.kind.description
    if len(i.kind.bonuses) > 0 {
        msg["bonuses"] = make([] consts.JsonType, 0, 30)
        for _, bonus := range i.kind.bonuses {
            msg["bonuses"] = append(msg["bonuses"].([] consts.JsonType), bonus.GetFullInfo())
        }
    }
    if len(i.kind.effects) > 0 {
        msg["effects"] = make([] consts.JsonType, 0, 30)
        for _, effect := range i.kind.effects {
            msg["effects"] = append(msg["effects"].([] consts.JsonType), effect.GetFullInfo())
        }
    }
    return msg
}

func (i *Item) GetOwner() Activer {
    return i.owner
}

func (i *Item) SetOwner(owner Activer) {
    i.owner = owner
}

func (i* Item) IsOwner(a Activer) bool {
    return i.HasOwner() && i.GetOwner().GetID() == a.GetID()
}

func (i* Item) SetPosition(p geometry.Point) {
    i.Center = p
}

func (i* Item) IsHeapItem() bool {
    return false
}

func (i* Item) IsEquipped() bool {
    return false
}

func (i* Item) IsWeapon() bool {
    return i.kind.itemType == consts.ITEM_T_WEAPON
}

func (i* Item) GetKind() *ItemKind {
    return i.kind
}

func (i* Item) GetKindId() int64 {
    return i.kind.dbId
}

func (i *Item) HasOwner() bool {
    return i.owner != nil
}

func (i *Item) GetWeight() int {
    return i.kind.weight
}

func (i *Item) GetItemType() int {
    return i.kind.itemType
}

func (i* Item) GetItemClass() int {
    return i.kind.class
}

func (i* Item) GetItemSubtype() int {
    return i.kind.subtype
}

func (i* Item) GetAmount() int {
    return 1
}

func (i* Item) DecAmount(int) {
}

func (i* Item) setAmount(int) {
}

func (i *Item) UseItem(*InventoryObj) {
    i.applyBonuses()
    i.applyEffects()
}

func (i *Item) UnuseItem() {
    i.cancelBonuses()
}

func (i *Item) EquipItem(*InventoryObj) int {
    return 0
}

func (i *Item) UnequipItem(*InventoryObj) int {
    return -1
}

func (i *Item) applyBonuses() {
    for _, bonus := range i.kind.bonuses {
        bonus.apply(i.owner)
    }
}

func (i *Item) applyEffects() {
    for _, effect := range i.kind.effects {
        effect.apply(i.owner)
    }
}

func (i *Item) cancelBonuses() {
    for _, bonus := range i.kind.bonuses {
        bonus.cancel(i.owner)
    }
}

type GarmentItem struct {
    Item
    isEquiped bool
}

func (i* GarmentItem) IsEquipped() bool {
    return i.isEquiped
}

func (i* GarmentItem) EquipItem(inv *InventoryObj) int {
    var place int = -1
    if !i.isEquiped {
        i.Item.UseItem(inv)
        place = inv.unplaceItem(i.GetID())
        i.isEquiped = true
    }
    return place
}

func (i* GarmentItem) UnequipItem(inv *InventoryObj) int {
    var place int = -1
    if i.isEquiped {
        i.Item.UnuseItem()
        place = inv.placeItem(i.GetID())
        i.isEquiped = false
    }
    return place
}

type WeaponItem struct {
    GarmentItem
    dmg fightBase.DmgDescription
}

type StackItem struct {
    Item
    amount int
}

func (i* StackItem) GetInfo() consts.JsonType {
    msg := i.Item.GetInfo()
    msg["amount"] = i.amount
    return msg
}

func (i* StackItem) GetAmount() int {
    return i.amount
}

func (i* StackItem) DecAmount(amount int) {
    i.amount -= amount
}

func (i* StackItem) setAmount(amount int) {
    i.amount = amount
}

func (i* StackItem) IsHeapItem() bool {
    return true
}

func (i* StackItem) UseItem(inv* InventoryObj) {
    i.Item.UseItem(inv)
    inv.DeleteItem(i, 1)
}

type ConsumableItem struct {
    StackItem
}

type ExpandableItem struct {
    StackItem
    isEquiped bool
}

func (i* ExpandableItem) IsEquipped() bool {
    return i.isEquiped
}

func (i* ExpandableItem) EquipItem(inv *InventoryObj) int {
    var place int = -1
    if !i.isEquiped {
        i.Item.UseItem(inv)
        place = inv.unplaceItem(i.GetID())
        i.isEquiped = true
    }
    return place
}

func (i* ExpandableItem) UnequipItem(inv *InventoryObj) int {
    var place int = -1
    if i.isEquiped {
        i.Item.UnuseItem()
        place = inv.placeItem(i.GetID())
        i.isEquiped = false
    }
    return place
}

func newItem(ik *ItemKind, owner Activer, amount ...interface{}) Itemer {
    var i Itemer = nil
    switch ik.class {
        case consts.ITEM_CLASS_CONSUMABLE: i = newConsumableItem(ik, owner, amount[0].(int))
        case consts.ITEM_CLASS_GARMENT:
            if ik.itemType == consts.ITEM_T_EXPENDABLE {
                i = &ExpandableItem{newStackItem(ik, owner, amount[0].(int)), false}
            } else {
                garment := GarmentItem{newBaseItem(ik, owner), false};
                if ik.itemType == consts.ITEM_T_WEAPON {
                    i = &WeaponItem{garment, fightBase.CreateDmgDescription(ik.power)}
                } else {
                    i = &garment
                }
            }
    }
    return i
}

func NewItemByID(iid int64, owner Activer, amount int) Itemer {
    var item Itemer = nil
    if ik, ok := gameItems.items[iid]; ok {
        item = newItem(ik, owner, amount)
    }
    return item
}

func NewFistItem(owner Activer) Itemer {
    if _, ok := gameItems.items[consts.FIST_ID]; !ok {
        gameItems.items[consts.FIST_ID] = &ItemKind{consts.FIST_ID, "кулаки от бога", 0, "10d4", "", "", consts.ITEM_CLASS_GARMENT, consts.ITEM_T_WEAPON, consts.ITEM_ST_DEFAULT, make([] *Bonus, 0, 0), make([] Effecter, 0, 0)}
    }
    return newItem(gameItems.items[consts.FIST_ID], owner)
}

func newBaseItem(ik *ItemKind, owner Activer) Item {
    return Item{GameObject{utils.GenerateId(), geometry.Point{-1, -1}}, ik, owner}
}

func newConsumableItem(ik* ItemKind, owner Activer, amount int) *ConsumableItem {
    return &ConsumableItem{newStackItem(ik, owner, amount)}
}

func newStackItem(ik *ItemKind, owner Activer, amount int) StackItem {
    return StackItem{newBaseItem(ik, owner), amount}
}

// func newExpandableItem(ik* ItemKind, owner Activer, amount int) *ConsumableItem {
//     return &ExpandableItem{StackItem{newBaseItem(ik, owner), amount}}
// }

func splitItem(inv* InventoryObj, i Itemer, amount int) (int, Itemer) {
    new_i := newConsumableItem(i.GetKind(), i.GetOwner(), i.GetAmount() - amount)
    place := inv.getPlaceById(i.GetID())
    inv.cells[place] = new_i.GetID()
    delete(inv.Items, i.GetID())
    inv.Items[new_i.GetID()] = new_i
    inv.kinds[new_i.GetKindId()] = new_i.GetID()
    i.SetOwner(nil)
    i.ForcePlace(i.GetOwner().GetCenter())
    i.setAmount(amount)
    return place, new_i
}

func ItemFromJson(itemDesc consts.JsonType) Itemer {
    var res Itemer
    errorMsg := "badItem"
    var requiredFields = map[string] string {
        "weight" : errorMsg,
        "class" : errorMsg,
        "type" : errorMsg,
        "bonuses" : errorMsg,
        "effects" : errorMsg,
    }
    if ok, _ := utils.CheckJsonRequest(itemDesc, requiredFields); ok {
        weight, ok1 := itemDesc["weight"].(float64)
        class, ok2 := itemDesc["class"].(string)
        itemType, ok3 := itemDesc["type"].(string)
        bonuses, ok4 := itemDesc["bonuses"].([] interface{})
        effects, ok5 := itemDesc["effects"].([] interface{})
        if ok1 && ok2 && ok3 && ok4 && ok5 {
            kind := &ItemKind{
                weight: int(weight),
                class: consts.NameItemClassMapping[class],
                itemType : consts.NameItemTypeMapping[itemType],
                bonuses : make([]*Bonus, 0, 100),
                effects : make([]Effecter, 0, 100),
            }
            for _, bonusDesc := range bonuses {
                kind.bonuses = append(kind.bonuses, BonusFromJson(bonusDesc.(consts.JsonType)))
            }
            for _, effectDesc := range effects {
                kind.effects = append(kind.effects, EffectFromJson(effectDesc.(consts.JsonType)))
            }
            return newItem(kind, nil)
            // return &Item{NewGameObject(utils.GenerateId(), *geometry.MakePoint(0, 0)), &kind, nil}
        }
    }
    return res
}
