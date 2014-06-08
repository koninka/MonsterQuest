package gameObjectsBase

import (
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    "MonsterQuest/utils"
    "strings"
    "time"
)

type Bonus struct {
    characteristic int
    effectCalculation int
    val int
}

func (b *Bonus) calcActualValue(owner Activer) int {
    bonusVal := b.val
    baseVal := owner.GetCharacteristic(b.characteristic)
    if b.effectCalculation == consts.BONUS_PERCENT {
        bonusVal = int(baseVal * b.val / 100.0)
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
    effect := string(b.val)
    if b.val > 0 {
        effect = "+" + effect
    }
    if b.effectCalculation == consts.BONUS_PERCENT {
        effect += "%"
    }
    bonusInfo["effect"] = effect
    return bonusInfo
}

func NewBonus(characteristic, effectCalculation, val int) *Bonus {
    return &Bonus{characteristic, effectCalculation, val}
}

type Effecter interface {
    apply(activator Activer)
    GetFullInfo() consts.JsonType
}

type Effect struct {
    duration time.Duration
}

type ModifyingEffect struct {
    Effect
    characteristic int
    val int
}

func (me *ModifyingEffect) apply(activator Activer) {
    dc := int(float64(me.val) / float64(me.duration))
    start := time.Now()
    for time.Since(start) < me.duration {
        activator.ModifyCharacteristic(me.characteristic, dc)
        time.Sleep(time.Second)
    }
}

func (me *ModifyingEffect) GetFullInfo() consts.JsonType {
    return make(consts.JsonType)
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
    return make(consts.JsonType)
}

func newModifyingEffect(duration time.Duration, characteristic, val int) *ModifyingEffect {
    return &ModifyingEffect{Effect{duration}, characteristic, val}
}

func newBonusEffect(duration time.Duration, bonus *Bonus) *BonusEffect {
    return &BonusEffect{Effect{duration}, *bonus}
}

type ItemKind struct {
    dbId int64
    name string
    weight int
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
    return NewItem(gigi.item_kind.dbId, owner)
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
    "WIS"   : consts.CHARACTERISTIC_WISDOM,
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
        bonuses = append(bonuses, NewBonus(BDString2IotaCharacteristic[c], 0, val))
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
            effects = append(effects, newModifyingEffect(duration, BDString2IotaCharacteristic[c], val))
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
    rows, _ := db.Query("SELECT id, name, atype, weight, allocation_info, message, description, bonus, effects FROM artifacts")
    for rows.Next() {
        var (
            id int64
            weight int
            atype_str, name, alloc_info_str, msg, desc, bonusesStr, effectsStr string
        )
        rows.Scan(&id, &name, &atype_str, &weight, &alloc_info_str, &msg, &desc, &bonusesStr, &effectsStr)
        atype := strings.Split(atype_str, ":")
        gameItems.items[id] = &ItemKind{id, name, weight, msg, desc, utils.ParseInt(atype[0]), utils.ParseInt(atype[1]), utils.ParseInt(atype[2]), make([] *Bonus, 0, 30), make([] Effecter, 0, 30)}
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
    consts.ITEM_T_AMULET : "amulet",
    consts.ITEM_T_RING   : "ring",
    consts.ITEM_T_ARMOR  : "armor",
    consts.ITEM_T_SHIELD : "shield",
    consts.ITEM_T_HELMET : "helmet",
    consts.ITEM_T_GLOVES : "gloves",
    consts.ITEM_T_BOOTS  : "boots",
    consts.ITEM_T_WEAPON : "weapon",
    consts.ITEM_T_POTION : "potion",
    consts.ITEM_T_SCROLL : "scroll",
}

type Itemer interface {
    GameObjecter
    GetOwner() Activer
    SetOwner(Activer)
    IsOwner(Activer) bool
    SetPosition(geometry.Point)
    IsHeapItem() bool
    IsEquiped() bool
    GetKind() *ItemKind
    GetKindId() int64
    HasOwner() bool
    GetWeight() int
    GetItemType() int
    GetAmount() int
    GetItemClass() int
    getAmount() int
    decAmount(int)
    setAmount(int)
    UseItem(*InventoryObj)
    UnuseItem()
    EquipItem(*InventoryObj)
    UnequipItem(*InventoryObj)
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

func (i* Item) IsEquiped() bool {
    return false
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

func (i* Item) GetAmount() int {
    return 1
}

func (i* Item) getAmount() int {
    return 1
}

func (i* Item) decAmount(int) {
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

func (i *Item) EquipItem(*InventoryObj) {

}

func (i *Item) UnequipItem(*InventoryObj) {

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

func (i* GarmentItem) IsEquiped() bool {
    return i.isEquiped
}

func (i* GarmentItem) UseItem(inv* InventoryObj) {
    if (i.isEquiped) {
        i.UnequipItem(inv)
    } else {
        i.EquipItem(inv)
    }
}

func (i* GarmentItem) EquipItem(inv *InventoryObj) {
    if !i.isEquiped {
        i.Item.UseItem(inv)
        inv.unplaceItem(i.GetID())
        i.isEquiped = true
    }
}

func (i* GarmentItem) UnequipItem(inv *InventoryObj) {
    if i.isEquiped {
        i.Item.UnuseItem()
        inv.placeItem(i.GetID())
        i.isEquiped = false
    }
}

type SummarizeItem struct {
    Item
    amount int
}

func (i* SummarizeItem) getAmount() int {
    return i.amount
}

func (i* SummarizeItem) decAmount(amount int) {
    i.amount -= amount
}

func (i* SummarizeItem) setAmount(amount int) {
    i.amount = amount
}

func (i* SummarizeItem) IsHeapItem() bool {
    return true
}

type FoodItem struct {
    SummarizeItem
}

func (i* FoodItem) UseItem(inv* InventoryObj) {
    i.Item.UseItem(inv)
    i.amount--
    if (i.amount <= 0) {
        inv.DeleteItem(i)
    }
}

func NewItem(iid int64, owner Activer, amount ...interface{}) Itemer {
    var i Itemer = nil
    switch gameItems.items[iid].class {
        case consts.ITEM_CLASS_FOOD:    i = newFoodItem(gameItems.items[iid], owner, amount[0].(int))
        case consts.ITEM_CLASS_GARMENT: i = &GarmentItem{newItem(gameItems.items[iid], owner), false}
        // case consts.ITEM_CLASS_AMMO:
    }
    return i
}

func newItem(ik *ItemKind, owner Activer) Item {
    return Item{GameObject{utils.GenerateId(), geometry.Point{-1, -1}}, ik, owner}
}

func newFoodItem(ik* ItemKind, owner Activer, amount int) *FoodItem {
    return &FoodItem{SummarizeItem{newItem(ik, owner), amount}}
}

func splitItem(inv* InventoryObj, i Itemer, amount int) int {
    new_i := newFoodItem(i.GetKind(), i.GetOwner(), i.GetAmount() - amount)
    place := inv.getPlaceById(i.GetID())
    inv.cells[place] = new_i.GetID()
    delete(inv.Items, i.GetID())
    inv.Items[new_i.GetID()] = new_i
    inv.kinds[new_i.GetKindId()] = new_i.GetID()
    i.SetOwner(nil)
    i.ForcePlace(i.GetOwner().GetCenter())
    i.setAmount(amount)
    return place
}
