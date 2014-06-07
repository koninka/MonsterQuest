package gameObjectsBase

import (
    "MonsterQuest/consts"
)

type InventoryObj struct {
    Items map[int64] Itemer
    kinds map[int64] int64 //kind_id to item_id on map
    cells map[int] int64
}

func (inv* InventoryObj) GetInfo() []consts.JsonType {
    inventory := make([] consts.JsonType, 0)
    for cell, item_id := range inv.cells {
        inventory = append(inventory, inv.Items[item_id].GetInfo())
        inventory[len(inventory) - 1]["cell"] = cell
    }
    return inventory
}

func (inv* InventoryObj) DropItem(i Itemer) int {
    delete(inv.Items, i.GetID())
    i.SetOwner(nil)
    var needDeleteKind bool = true
    for kind_id, item_id := range inv.kinds {
        if kind_id == i.GetKindId() && item_id != i.GetID() {
            needDeleteKind = false
            break
        }
    }
    if needDeleteKind {
        delete(inv.kinds, i.GetKindId())
    }
    place := inv.getPlaceById(i.GetID())
    return place
}

func (inv* InventoryObj) AddItem(i Itemer, owner Activer) int {
    var place int = -1
    if item_id, isExist := inv.kinds[i.GetKindId()]; isExist {
        if inv.Items[item_id].IsHeapItem() {
            i = nil
            place = inv.getPlaceById(item_id)
            // inv.Items[item_id]
            // item.IncAmount
        }
    } else {
        inv.kinds[i.GetKindId()] = i.GetID()
    }
    if place == -1 {
        inv.Items[i.GetID()] = i
        i.SetOwner(owner)
        place = inv.placeItem(i.GetID())
    }
    return place
}

func (inv* InventoryObj) RestoreItem(i Itemer, place int) {
    var id int64 = i.GetID()
    inv.cells[place] = id
    inv.kinds[i.GetKindId()] = id
    inv.Items[i.GetID()] = i
}

func (inv* InventoryObj) GetPlace(id int64) int {
    return inv.getPlaceById(id)
}

func (inv* InventoryObj) getPlaceById(id int64) int {
    for cell, item_id := range inv.cells {
        if item_id == id {
            return cell
        }
    }
    return -1
}

func (inv *InventoryObj) EquipItem(i Itemer) {
    for cell, item_id := range inv.cells {
        if item_id == i.GetID() {
            inv.Items[item_id].UseItem()
            delete(inv.cells, cell)
            break
        }
    }
}

func (inv *InventoryObj) UnequipItem(i Itemer) {
    inv.placeItem(i.GetID())
    inv.Items[i.GetID()].UnuseItem()
}

func (inv* InventoryObj) MoveItem(i Itemer, from_cell, to_cell int) {
    if iid, isExist := inv.cells[to_cell]; isExist {
        if i.GetID() == iid {
            return
        }
        inv.cells[from_cell] = inv.cells[to_cell]
    } else {
        delete(inv.cells, from_cell)
    }
    inv.cells[to_cell] = i.GetID()
}

func (inv *InventoryObj) placeItem(id int64) int {
    var idx int = 0
    for true {
        if _, isExist := inv.cells[idx]; !isExist {
            inv.cells[idx] = id
            break
        }
        idx++
    }
    return idx
}

func (inv *InventoryObj) GetItem(id int64) Itemer {
    return inv.Items[id]
}

func (inv *InventoryObj) HasItem(id int64) bool {
    _, exist := inv.Items[id]
    return exist
}

func (inv *InventoryObj) GetWeight() int {
    weight := 0
    for _, item := range inv.Items {
        weight += item.GetWeight()
    }
    return weight
}

func NewInventoryObj() *InventoryObj {
    return &InventoryObj{make(map[int64] Itemer), make(map[int64] int64), make(map[int]int64)}
}
