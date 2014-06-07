package gameObjectsBase

import (
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    "MonsterQuest/utils"
    "strings"
    "fmt"
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

type ItemKind struct {
    dbId int64
    name string
    weight int
    message string
    description string
    itemType int
    subtype int
    bonuses [] *Bonus
}

type gameItemGen struct {
    item_kind *ItemKind
    probability int
}

func (gigi* gameItemGen) Probability() int {
    return gigi.probability
}

func (gigi* gameItemGen) GenItem(owner Activer) *Item {
    return &Item{GameObject{utils.GenerateId(), geometry.Point{-1, -1}}, gigi.item_kind, owner}
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
}

func InitGameItems() {
    db := connect.CreateConnect()
    rows, _ := db.Query("SELECT id, name, atype, weight, allocation_info, message, description, bonus FROM artifacts")
    for rows.Next() {
        var (
            id int64
            weight int
            atype_str, name, alloc_info_str, msg, desc, bonusStr string
        )
        rows.Scan(&id, &name, &atype_str, &weight, &alloc_info_str, &msg, &desc, &bonusStr)
        atype := strings.Split(atype_str, ":")
        gameItems.items[id] = &ItemKind{id, name, weight, msg, desc, utils.ParseInt(atype[0]), utils.ParseInt(atype[1]), make([] *Bonus, 0, 30)}
        alloc_info := strings.Split(alloc_info_str, ":");
        prob := utils.ParseInt(alloc_info[0])
        min_d := utils.ParseInt64(alloc_info[1]) - 1
        max_d := utils.ParseInt64(alloc_info[2]) - 1
        for i := min_d; i <= max_d; i++ {
            gameItems.items_depth_gen[i] = append(gameItems.items_depth_gen[i], &gameItemGen{gameItems.items[id], prob})
        }
        for _, bonus := range strings.Split(bonusStr, "@") {
            if len(bonus) == 0 {
                continue
            }
            parts := strings.Split(bonus, ":")
            val := utils.ParseInt(parts[0])
            for _, c := range strings.Split(parts[1], "|") {
                gameItems.items[id].bonuses = append(gameItems.items[id].bonuses, NewBonus(BDString2IotaCharacteristic[c], 0, float64(val)))
            }
        } 
    }
}

type Item struct {
    GameObject
    kind *ItemKind
    owner Activer
}

func (i *Item) GetType() string {
    return consts.ITEM_TYPE
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

func (i* Item) SetPosition(p geometry.Point) {
    i.Center = p
}

func (i* Item) IsHeapItem() bool {
    return false
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

func (i *Item) ApplyBonuses() {
    for _, bonus := range i.kind.bonuses {
        bonus.apply(i.owner)
    }
}

func (i *Item) CancelBonuses() {
    for _, bonus := range i.kind.bonuses {
        bonus.cancel(i.owner)
    }
}

func NewItem(iid int64, owner Activer) *Item {
    return newItem(gameItems.items[iid], owner)
}

func newItem(ik *ItemKind, owner Activer) *Item {
    return &Item{GameObject{utils.GenerateId(), geometry.Point{-1, -1}}, ik, owner}
}
