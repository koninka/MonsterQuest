package gameObjectsBase

import (
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    "MonsterQuest/utils"
    "strings"
)

func GetTypeByIota(itemType int) string {
    switch (itemType) {
        case consts.ITEM_AMULET:
            return "amulet"
        case consts.ITEM_RING:
            return "ring"
        case consts.ITEM_ARMOR:
            return "armor"
        case consts.ITEM_SHIELD:
            return "shield"
        case consts.ITEM_HELMET:
            return "helmet"
        case consts.ITEM_GLOVES:
            return "gloves"
        case consts.ITEM_BOOTS:
            return "boots"
        case consts.ITEM_SWORD:
            return "sword"
        case consts.ITEM_POLEARM:
            return "polearm"
        case consts.ITEM_BOW:
            return "bow"
        case consts.ITEM_POTION:
            return "potion"
        case consts.ITEM_SCROLL:
            return "scroll"
    }
    return "somethingElse"
}

type Bonus struct {}

type ItemKind struct {
    name string
    weight int
    message string
    description string
    itemType int
}

func NewItemKind(name, description string, itemType int) *ItemKind {
    return &ItemKind{}
}

type gameItemGen struct {
    item_kind *ItemKind
    probability int
}

func (gigi* gameItemGen) Probability() int {
    return gigi.probability
}

func (gigi* gameItemGen) GenItem(owner Activer) *Item {
    return &Item{GameObject{utils.GenerateId(), geometry.Point{-1, -1}}, gigi.item_kind, make([] *Bonus, 0, 10), owner}
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

func InitGameItems() {
    db := connect.CreateConnect()
    rows, _ := db.Query("SELECT id, name, atype, weight, allocation_info, message, description FROM artifacts")
    for rows.Next() {
        var (
            id int64
            atype, weight int
            name, alloc_info_str, msg, desc string
        )
        rows.Scan(&id, &name, &atype, &weight, &alloc_info_str, &msg, &desc)
        gameItems.items[id] = &ItemKind{name, weight, msg, desc, atype}
        alloc_info := strings.Split(alloc_info_str, ":");
        prob := utils.ParseInt(alloc_info[0])
        min_d := utils.ParseInt(alloc_info[1]) - 1
        max_d := utils.ParseInt(alloc_info[2]) - 1
        for i := min_d; i <= max_d; i++ {
            gameItems.items_depth_gen[i] = append(gameItems.items_depth_gen[i], &gameItemGen{gameItems.items[id], int(prob)})
        }
    }
}

type Item struct {
    GameObject
    kind *ItemKind
    bonuses [] *Bonus
    owner Activer
}

func (i *Item) AddBonus(b *Bonus) {
    i.bonuses = append(i.bonuses, b)
}

func (i *Item) GetType() string {
    return consts.ITEM_TYPE
}

func (i *Item) GetInfo() consts.JsonType {
    msg := i.GameObject.GetInfo()
    msg["name"] = i.kind.name
    msg["description"] = i.kind.description
    msg["itemType"] = GetTypeByIota(i.kind.itemType)
    msg["type"] = consts.ITEM_TYPE
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

func (i *Item) HasOwner() bool {
    return i.owner != nil
}

func (i *Item) GetItemType() int {
    return i.kind.itemType
}
