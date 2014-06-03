package engine

import (
    "MonsterQuest/gameObjectsBase"
)

type itemList struct {
    items map[int64] *gameObjectsBase.Item
}

func (il *itemList) addItem(i *gameObjectsBase.Item) {
    il.items[i.GetID()] = i
}

func (il *itemList) getItem(id int64) *gameObjectsBase.Item {
    return il.items[id]
}