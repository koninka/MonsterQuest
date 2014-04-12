package gameObjectsFlags

import (
	"MonsterQuest/gameMap"
	"MonsterQuest/gameObjectsBase"
)

var flags map[string] gameObjectsBase.Flager = make(map[string] gameObjectsBase.Flager)

func InitFlags(field *gameMap.GameField) {
	flags["CAN_MOVE"] = &MoveFlag{Flag{field}}
}

func GetFlag(name string) gameObjectsBase.Flager {
	return flags[name]
}
