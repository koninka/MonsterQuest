package engine

import (
    "MonsterQuest/gameObjectsBase"
)

type itemList struct {
    items map[int64] gameObjectsBase.Itemer
}

func (il *itemList) addItem(i gameObjectsBase.Itemer) {
    il.items[i.GetID()] = i
}

func (il *itemList) getItem(id int64) gameObjectsBase.Itemer {
    return il.items[id]
}

func (il *itemList) deleteItem(i gameObjectsBase.Itemer) {
    delete(il.items, i.GetID())
}

func (il *itemList) Clear() {
    for id, item := range il.items {
        GetInstance().field.UnlinkFromCells(item)
        delete(il.items, id)
    }
}
