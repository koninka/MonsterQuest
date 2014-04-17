package gameObjectsFlags

import (
	"MonsterQuest/gameMap"
	"MonsterQuest/gameObjectsBase"
	"MonsterQuest/consts"
)

var flags map[string] gameObjectsBase.Flager = make(map[string] gameObjectsBase.Flager)

func InitFlags(field *gameMap.GameField, msgsChan chan consts.JsonType) {
	flags["CAN_MOVE"] = &MoveFlag{Flag{field, msgsChan}}
	flags["CAN_BLOW"] = &BlowFlag{Flag{field, msgsChan}}
	flags["HATE_PLAYERS"] = &HateFlag{Flag{field, msgsChan}, consts.PLAYER}
	flags["HATE_TROLLS"] = &HateFlag{Flag{field, msgsChan}, consts.TROLL}
	flags["HATE_ORCS"] = &HateFlag{Flag{field, msgsChan}, consts.ORC}
}

func GetFlag(name string) gameObjectsBase.Flager {
	return flags[name]
}
