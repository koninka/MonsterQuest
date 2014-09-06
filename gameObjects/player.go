package gameObjects

import (
    "fmt"
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    pm "MonsterQuest/projectileManager"
)

type playerKind struct {
    gameObjectsBase.Kind
}

func (pk *playerKind) GetName() string {
    return "player"
}

func (pk *playerKind) GetDescription() string {
    return ""
}

var kind *playerKind

func getPlayerKind() *playerKind {
    if kind == nil {
        kind = &playerKind{gameObjectsBase.NewKind()}
        kind.SetRace(consts.PLAYER_RACE)
        kind.Flags = append(kind.Flags, gameObjectsFlags.GetFlag("CAN_MOVE"))
        kind.Flags = append(kind.Flags, gameObjectsFlags.GetFlag("CAN_BLOW"))
    }
    return kind
}

type slot struct {
    itemTypes []int
    item gameObjectsBase.Itemer
}

func (s* slot) isSuitableType(it int) bool {
    var result bool = false
    for _, v := range s.itemTypes {
        result = result || it == v
    }
    return result
}

func newSlot(itemTypes []int) *slot {
    return &slot{itemTypes, nil}
}

type Player struct {
    gameObjectsBase.ActiveObject
    Login string
    SID string
    DBId int64
    slots map[int] *slot
    weapon fightBase.Blower
    fist gameObjectsBase.Itemer
}

func (p *Player) GetType() string {
    return consts.PLAYER_TYPE
}

func (p* Player) GetInventoryInfo() []consts.JsonType {
    return p.Inventory.GetInfo()
}

func (p *Player) GetInfo() consts.JsonType {
    info := p.ActiveObject.GetInfo()
    info["login"] = p.Login
    info["type"] = consts.PLAYER_TYPE
    return info
}

func (p *Player) GetFullInfo() consts.JsonType {
    info := p.MergeInfo(p.GetInfo())
    slots := make(map[string] consts.JsonType)
    for slot, slotName := range consts.SlotNameMapping {
        if p.slots[slot].item != nil {
            slots[slotName] = p.slots[slot].item.GetFullInfo()
        }
    }
    info["slots"] = slots
    return info
}

func (p *Player) Do() {
    p.DoWithObj(p)
    p.Dir = -1
}

func (p *Player) Attack() consts.JsonType {
    var res consts.JsonType = nil
    li := p.slots[consts.SLOT_LEFT_HAND].item
    ri := p.slots[consts.SLOT_RIGHT_HAND].item
    ai := p.slots[consts.SLOT_AMMO].item
    pc := p.GetCenter()
    target, existTarget := p.GetTarget()
    if ((li != nil && li.GetItemSubtype() == consts.ITEM_ST_BOW) || (ri != nil && ri.GetItemSubtype() == consts.ITEM_ST_BOW)) && ai != nil {
        var pt geometry.Point
        if existTarget {
            pt = target.GetCenter()
        } else {
            pt = *p.GetAttackPoint()
        }
        pm.PManager.NewArrowProjectile(&pc, &pt, 30, p)
        p.DeleteItem(ai, 1)
        // ai.DecAmount()
    } else if existTarget {
        if d := geometry.Distance(pc, target.GetCenter()); d <= p.GetAttackRadius() {
            res = target.GetHit(p.weapon, p)
        }
        if res != nil {
            res["attacker"] = p.GetID()
            res["target"] = target.GetID()
        }
    }
    p.ClearAttackPoint()
    p.Target = nil
    return res
}

func (p* Player) getNearbySlot(slotIota, subtype int) (bool, int) {
    var (
        s int = -1
        result bool = (slotIota == consts.SLOT_LEFT_HAND || slotIota == consts.SLOT_RIGHT_HAND) &&
                    (subtype == consts.ITEM_ST_BOW || subtype == consts.ITEM_ST_TWO_HANDED)
    )
    if result {
        if slotIota == consts.SLOT_LEFT_HAND {
            s = consts.SLOT_RIGHT_HAND
        } else {
            s = consts.SLOT_LEFT_HAND
        }
    }
    return result, s
}

func (p* Player) RestoreItem(item gameObjectsBase.Itemer, place int) {
    p.Inventory.RestoreItem(item, place)
    item.SetOwner(p)
}

func (p* Player) RestoreSlot(item gameObjectsBase.Itemer, slotIota int) {
    p.Inventory.RestoreItem(item)
    p.slots[slotIota].item = item
    if ok, s := p.getNearbySlot(slotIota, item.GetItemSubtype()); ok {
        if p.slots[s].item != nil {
            p.slots[s].item = nil
        }
        // p.slots[s].item = item
    }
    item.EquipItem(p.Inventory)
    item.SetOwner(p)
}

func (p* Player) getSlotByItem(item gameObjectsBase.Itemer) int {
    var slot int = consts.SLOT_DEFAULT
    for i, s := range p.slots {
        if s.item != nil && (s.item.GetID() == item.GetID()) {
            slot = i
            break
        }
    }
    return slot
}

func (p* Player) getSlotByItemType(it int) int {
    var slot int = consts.SLOT_DEFAULT
    for i, s := range p.slots {
        if s.isSuitableType(it) {
            slot = i
            break
        }
    }
    return slot
}

func (p* Player) DropItem(item gameObjectsBase.Itemer, amount int) (int, gameObjectsBase.Itemer) {
    db := connect.CreateConnect()
    place, new_item := p.ActiveObject.DropItem(item, amount)
    if s := p.getSlotByItem(item); s != consts.SLOT_DEFAULT {
        if item.GetAmount() - amount <= 0 {
            p.slots[s].item = nil
        }
        db.Exec("CALL dec_user_slot_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), s, amount)
    } else {
        db.Exec("CALL dec_user_item_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), place, amount)
    }
    return place, new_item
}

func (p* Player) PickUpItem(item gameObjectsBase.Itemer) (bool, gameObjectsBase.Itemer) {
    var err error = nil
    db := connect.CreateConnect()
    place, i := p.AddItem(item)
    if item.IsHeapItem() && place == -1 {
        _, err = db.Exec("CALL inc_user_slot_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), p.getSlotByItemType(item.GetItemType()), item.GetAmount())
    } else {
        _, err = db.Exec("CALL inc_user_item_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), place, item.GetAmount());
    }
    if err != nil {
        //
        fmt.Println(err)
    }
    return err == nil, i
}

func (p* Player) DeleteItem(item gameObjectsBase.Itemer, amount int) (bool, gameObjectsBase.Itemer) {
    var (
        i gameObjectsBase.Itemer = item
        res bool = false
    )
    db := connect.CreateConnect()
    var place int
    place, i = p.Inventory.DeleteItem(item, amount)
    if s := p.getSlotByItem(item); s != consts.SLOT_DEFAULT {
        if item.GetAmount() <= 0 {
            p.slots[s].item = nil
        }
        _, err := db.Exec("CALL dec_user_slot_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), s, amount);
        res = err == nil
    } else {
        _, err := db.Exec("CALL dec_user_item_amount(?, ?, ?, ?)", p.DBId, item.GetKindId(), place, amount);
        res = err == nil
    }
    return res, i
}

func (p *Player) Equip(item gameObjectsBase.Itemer, slotIota int) (bool, consts.JsonType) {
    var res consts.JsonType = nil
    slot := p.slots[slotIota]
    if slot == nil || !slot.isSuitableType(item.GetItemType())  || item.GetItemClass() != consts.ITEM_CLASS_GARMENT || p.Equipped(item) {
        return false, res
    }
    p.Unequip(slotIota)
    db := connect.CreateConnect()
    _, err := db.Exec("CALL equip_item(?, ?, ?, ?)", p.DBId, item.GetKindId(), item.EquipItem(p.Inventory), slotIota);
    if err == nil {
        if ok, s := p.getNearbySlot(slotIota, item.GetItemSubtype()); ok {
            if p.slots[s].item != nil && p.slots[s].item.GetID() != item.GetID() {
                p.Unequip(s)
            }
            res = consts.JsonType {}
            res[consts.SlotNameMapping[s]] = item.GetID()
            p.slots[s].item = nil
        } else {
            p.Unequip(slotIota)
        }
        slot.item = item
    }
    return err == nil, res
}

func (p *Player) Unequip(slotIota int) (bool, consts.JsonType) {
    var res consts.JsonType = nil
    slot := p.slots[slotIota]
    if slot.item == nil {
        return false, res
    }
    db := connect.CreateConnect()
    k := slot.item.GetKindId()
    place := slot.item.UnequipItem(p.Inventory)
    _, err := db.Exec("CALL unequip_item(?, ?, ?, ?)", p.DBId, k, place, slotIota)
    if err == nil {
        if ok, s := p.getNearbySlot(slotIota, slot.item.GetItemSubtype()); ok {
            if p.slots[s].item != nil && p.slots[s].item.GetID() == slot.item.GetID() {
                res = consts.JsonType {}
                res[consts.SlotNameMapping[s]] = slot.item.GetID()
                p.slots[s].item = nil
            }
        }
        slot.item = nil
    }
    return err == nil, res
}

func (p *Player) GetHit(blow fightBase.Blower, attacker gameObjectsBase.Activer) consts.JsonType {
    res := p.ActiveObject.GetHit(blow, attacker)
    return res
}

func (p *Player) Equipped(item gameObjectsBase.Itemer) bool {
    for _, slot := range p.slots {
        if slot.item != nil && slot.item.GetID() == item.GetID() {
            return true
        }
    }
    return false
}

func (p *Player) MoveItem(item gameObjectsBase.Itemer, to_cell int) bool {
    if owner := item.GetOwner(); (owner != nil && owner.GetID() != p.GetID()) || p.Equipped(item) {
        return false
    }
    from_cell := p.Inventory.GetPlace(item.GetID())
    if from_cell == to_cell {
        return true
    } else {
        db := connect.CreateConnect()
        _, err := db.Exec("CALL move_item(?, ?, ?)", p.DBId, from_cell, to_cell);
        if err == nil {
            p.Inventory.MoveItem(item, from_cell, to_cell)
        }
        return err == nil
    }
}

func (p* Player) UseItem(id int64) {
    if p.Inventory.HasItem(id) {
        p.Inventory.GetItem(id).UseItem(p.Inventory)
    }
}

func (p *Player) GetCapacity() int {
    return p.Characteristics[consts.CHARACTERISTIC_CAPACITY]
}

func (p *Player) CanPickUp(item gameObjectsBase.Itemer) bool {
    return p.Inventory.GetWeight() + item.GetWeight() <= p.GetCapacity()
}

func (p *Player) GetItem(id int64) gameObjectsBase.Itemer {
    if p.fist.GetID() == id {
        return p.fist
    } else {
        return p.Inventory.GetItem(id)
    }
}

func (p *Player) IsEquippedItem(item gameObjectsBase.Itemer) bool {
    return (item.GetID() == p.fist.GetID() && (p.slots[consts.SLOT_LEFT_HAND].item == nil || p.slots[consts.SLOT_RIGHT_HAND].item == nil)) || item.IsEquipped()
}

func (p *Player) GetFistID() int64 {
    return p.fist.GetID()
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) *Player {
    slots := make(map[int] *slot)
    for slotType, itemType := range consts.SlotItemMapping {
        slots[slotType] = newSlot(itemType)
    }
    p := &Player{gameObjectsBase.NewActiveObject(id, x, y, getPlayerKind()),
        login, sid, dbId, slots, wpns.GetWeapon(consts.FIST_WEAP), nil}
    p.fist  = gameObjectsBase.NewFistItem(p)
    return p
}
