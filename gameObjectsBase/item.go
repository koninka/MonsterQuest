package gameObjectsBase

import (
	"MonsterQuest/consts"
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

type Item struct {
    GameObject
    name string
    description string
    itemType int
    bonuses [] *Bonus
}

func (i *Item) AddBonus(b *Bonus) {
	i.bonuses = append(i.bonuses, b)
}

func (i *Item) GetType() string {
	return consts.ITEM_TYPE
}

func (i *Item) GetInfo() consts.JsonType {
    msg := i.GameObject.GetInfo()
	msg["name"] = i.name
	msg["description"] = i.description
	msg["itemType"] = GetTypeByIota(i.itemType)
	msg["type"] = consts.ITEM_TYPE
	return msg
}