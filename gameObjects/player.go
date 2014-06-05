package gameObjects

import (
    wpns "MonsterQuest/gameStuff/weapons"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsFlags"
    "MonsterQuest/consts"
    "MonsterQuest/geometry"
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
    item *gameObjectsBase.Item
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
    slots map[string] *slot
}

func (p *Player) GetType() string {
    return consts.PLAYER_TYPE
}

func (p *Player) GetInfo() consts.JsonType {
    info := p.ActiveObject.GetInfo()
    info["login"] = p.Login
    info["type"] = consts.PLAYER_TYPE
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

func (p *Player) Equip(item *gameObjectsBase.Item, slotName string) bool {
    slot := p.slots[slotName]
    if slot == nil || slot.itemType != item.GetItemType() {
        return false
    }
    slot.item = item
    return true
}

func (p *Player) Unequip(slotName string) bool {
    slot := p.slots[slotName]
    if slot == nil {
        return false
    }
    slot.item = nil
    return true
}

func (p *Player) GetHit(blow fightBase.Blower, attacker gameObjectsBase.Activer) consts.JsonType {
    res := p.ActiveObject.GetHit(blow, attacker)
    return res
}

func (p *Player) Equipped(item *gameObjectsBase.Item) bool {
    for _, slot := range p.slots {
        if slot.item == item {
            return true
        }
    }
    return false
}

func (p *Player) MoveItem(item *gameObjectsBase.Item, cell int64) bool {
    if item.GetOwner() != p || p.Equipped(item) {
        return false
    }
    if p.Inventory.CellIsEmpty(cell) {
        item.SetCell(cell)
    }
    return true
}

func NewPlayer(id, dbId int64, login, sid string, x, y float64) Player {
    slots := make(map[string] *slot)
    slots["weapon"] = newSlot(consts.ITEM_T_WEAPON)
    slots["ring"] = newSlot(consts.ITEM_T_RING)
    slots["amulet"] = newSlot(consts.ITEM_T_AMULET)
    slots["armor"] = newSlot(consts.ITEM_T_ARMOR)
    slots["shield"] = newSlot(consts.ITEM_T_SHIELD)
    slots["helmet"] = newSlot(consts.ITEM_T_HELMET)
    slots["boots"] = newSlot(consts.ITEM_T_BOOTS)
    slots["gloves"] = newSlot(consts.ITEM_T_GLOVES)
    return Player{gameObjectsBase.NewActiveObject(id, consts.INITIAL_PLAYER_HP, x, y, getPlayerKind()),
        login, sid, dbId, wpns.GetWeapon(consts.FIST_WEAP), slots}
}
