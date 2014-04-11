package gameObjectsBehavior

import (
	"MonsterQuest/gameMap"
	"MonsterQuest/gameObjectsBase"
)

var behaviors map[string] gameObjectsBase.Flager = make(map[string] gameObjectsBase.Flager)

func InitBehaviors(field *gameMap.GameField) {
	behaviors["CAN_MOVE"] = &MoveBehavior{Behavior{field}}
}

func GetBehavior(name string) gameObjectsBase.Flager {
	return behaviors[name]
}
