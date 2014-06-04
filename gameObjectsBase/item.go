package gameObjectsBase

import (
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
)

func GetTypeByIota(itemType int) string {
    switch (itemType) {
        case consts.ITEM_GLOVES:
            return "gloves"
        case consts.ITEM_ARMOR:
            return "armor"
        case consts.ITEM_BOOTS:
            return "boots"
        case consts.ITEM_HELMET:
            return "helmet"
        case consts.ITEM_AMULET:
            return "amulet"
        case consts.ITEM_RING:
            return "ring"
        case consts.ITEM_WEAPON:
            return "weapon"
    }
    return "somethingElse"
}

type Bonus struct {}

type ItemKind struct {
    name string
    description string
    itemType int
}

func NewItemKind(name, description string, itemType int) *ItemKind {
    return &ItemKind{name, description, itemType}
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

func (i *Item) HasOwner() bool {
    return i.owner != nil
}

func (i *Item) GetItemType() int {
    return i.kind.itemType
}

func NewItem(id int64, x, y float64, kind *ItemKind) *Item {
    return &Item{GameObject{id, geometry.Point{x, y}}, kind, make([] *Bonus, 0, 10), nil}
}