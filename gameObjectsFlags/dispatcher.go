package gameObjectsFlags

import (
	"MonsterQuest/gameMap"
	"MonsterQuest/gameObjectsBase"
	"MonsterQuest/consts"
)

var flags map[string] gameObjectsBase.Flager = make(map[string] gameObjectsBase.Flager)

func InitFlags(field *gameMap.GameField) {
	flags["CAN_MOVE"] = &MoveFlag{Flag{field}}
	flags["CAN_BLOW"] = &AttackFlag{Flag{field}}
	flags["HATE_TROLLS"] = &HateFlag{Flag{field}, consts.TROLL}
	flags["HATE_ORCS"] = &HateFlag{Flag{field}, consts.ORC}
}

func GetFlag(name string) gameObjectsBase.Flager {
	return flags[name]
}
