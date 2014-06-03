package gameObjectsBase

import (
	"MonsterQuest/consts"
)


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
	msg := make(consts.JsonType)
	msg["name"] = i.name
	msg["description"] = i.description
	msg["itemType"] = GetTypeByIota(i.itemType)
	msg["type"] = consts.ITEM_TYPE
	return msg
}
