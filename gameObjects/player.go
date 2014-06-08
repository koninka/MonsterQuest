package gameObjects

import (
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
    "MonsterQuest/connect"
    "MonsterQuest/utils"
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
    itemType int
    item gameObjectsBase.Itemer
}

func newSlot(itemType int) *slot {
    return &slot{itemType, nil}
}

type Player struct {
    gameObjectsBase.ActiveObject
    Login string
    SID string
    DBId int64
    weapon fightBase.Blower
    slots map[int] *slot
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
    info := p.ActiveObject.GetFullInfo()
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
    t, _ := p.GetTarget()
    if d := geometry.Distance(p.GetCenter(), t.GetCenter()); d < 1.4 {
        res = t.GetHit(p.weapon, p)
    }
    if res != nil {
        res["attacker"] = p.GetID()
        res["target"] = t.GetID()
    }
    p.Target = nil
    return res
}

func (p* Player) RestoreItem(item gameObjectsBase.Itemer, place int) {
    p.Inventory.RestoreItem(item, place)
}

func (p* Player) DropItem(item gameObjectsBase.Itemer) int {
    db := connect.CreateConnect()
    place := p.ActiveObject.DropItem(item)
    _, err := db.Exec("CALL drop_user_item(?, ?, ?, ?)", p.DBId, item.GetKindId(), place, 1);
    if err != nil {
        //-
    }
    return place
    // return err == nil
}

func (p* Player) PickUpItem(item gameObjectsBase.Itemer) bool {
    db := connect.CreateConnect()
    _, err := db.Exec("CALL add_user_item(?, ?, ?, ?)", p.DBId, item.GetKindId(), p.AddItem(item), 1);
    if err != nil {
    }
    return err == nil
}

func (p *Player) Equip(item gameObjectsBase.Itemer, slotIota int) bool {
    slot := p.slots[slotIota]
    if slot == nil || slot.itemType != item.GetItemType() || item.GetItemClass() != consts.ITEM_CLASS_GARMENT {
        return false
    }
    item.EquipItem(p.Inventory)
    slot.item = item
    return true
}

func (p *Player) Unequip(slotIota int) bool {
    slot := p.slots[slotIota]
    if slot == nil {
        return false
    }
    slot.item.UnequipItem(p.Inventory)
    slot.item = nil
    return true
}

func (p *Player) GetHit(blow fightBase.Blower, attacker gameObjectsBase.Activer) consts.JsonType {
    res := p.ActiveObject.GetHit(blow, attacker)
    return res
}

func (p *Player) Equipped(item gameObjectsBase.Itemer) bool {
    for _, slot := range p.slots {
        if slot.item == item {
            return true
        }
    }
    return false
}

func (p *Player) MoveItem(item gameObjectsBase.Itemer, to_cell int) bool {
    if item.GetOwner().GetID() != p.GetID() || p.Equipped(item) {
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

func (p* Player) Use(id int64, x, y, ammoId interface{}) consts.JsonType {
    res := make(consts.JsonType)
    res["action"] = "use"
    res["action"] = "badId"
    if p.Inventory.HasItem(id) {
        item := p.Inventory.GetItem(id)
        if item.IsEquiped() {

        }
    }
    return res
}

func (p *Player) GetCapacity() int {
    return 100
}

func (p *Player) CanPickUp(item gameObjectsBase.Itemer) bool {
    return p.Inventory.GetWeight() + item.GetWeight() <= p.GetCapacity()
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) *Player {
    slots := make(map[int] *slot)
    for slotType, itemType := range consts.SlotItemMapping {
        slots[slotType] = newSlot(itemType)
    }
    return &Player{gameObjectsBase.NewActiveObject(id, -1, -1, x, y, getPlayerKind()),
        login, sid, dbId, wpns.GetWeapon(consts.FIST_WEAP), slots}
}
