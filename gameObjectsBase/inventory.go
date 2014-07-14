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

func (inv* InventoryObj) dropItem(i Itemer) int {
    delete(inv.Items, i.GetID())
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
    delete(inv.cells, place)
    return place
}

func (inv* InventoryObj) DeleteItem(i Itemer, amount int) (int, Itemer) {
    var place int = inv.getPlaceById(i.GetID())
    if i.GetAmount() - amount <= 0 {
        place = inv.dropItem(i)
        i = nil
    } else {
        i.DecAmount(amount)
    }
    return place, i
}

func (inv* InventoryObj) DropItem(i Itemer, amount int) (int, Itemer) {
    var (
        v bool =  true
        place int
        new_item Itemer = nil
    )
    if i.IsHeapItem() {
        if i.GetAmount() - amount > 0 {
            place, new_item = splitItem(inv, i, amount)
            v = false
        }
    }
    if v {
        place = inv.dropItem(i)
        i.ForcePlace(i.GetOwner().GetCenter())
        i.SetOwner(nil)
    }
    return place, new_item
}

func (inv* InventoryObj) AddItem(item Itemer, owner Activer) (int, Itemer) {
    var (
        i Itemer = item
        place int = -1
    )
    if item_id, isExist := inv.kinds[item.GetKindId()]; isExist {
        if inv.Items[item_id].IsHeapItem() {
            place = inv.getPlaceById(item_id)
            inv.Items[item_id].incAmount(item.GetAmount())
            i = nil
            i = inv.Items[item_id]
        }
    } else {
        inv.kinds[item.GetKindId()] = item.GetID()
    }
    if place == -1 {
        inv.Items[item.GetID()] = i
        item.SetOwner(owner)
        place = inv.placeItem(item.GetID())
    }
    return place, i
}

func (inv* InventoryObj) RestoreItem(i Itemer, place ...int) {
    var id int64 = i.GetID()
    inv.kinds[i.GetKindId()] = id
    inv.Items[i.GetID()] = i
    if len(place) > 0 {
        inv.cells[place[0]] = id
    }
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

func (inv *InventoryObj) unplaceItem(id int64) int {
    var cell int = -1
    for c, item_id := range inv.cells {
        if item_id == id {
            cell = c
            delete(inv.cells, cell)
            break
        }
    }
    return cell
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
