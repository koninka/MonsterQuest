package gameObjectsFlags

import (
	"MonsterQuest/gameMap"
	"MonsterQuest/gameObjectsBase"
	"MonsterQuest/consts"
)

var raceFlags map[string] int = make(map[string] int)
var flags map[string] gameObjectsBase.Flager = make(map[string] gameObjectsBase.Flager)

func InitFlags(field *gameMap.GameField, msgsChan chan consts.JsonType) {
	flags["CAN_MOVE"] = &MoveFlag{Flag{field, msgsChan}}
	flags["CAN_BLOW"] = &BlowFlag{Flag{field, msgsChan}}

	flags["HATE_ORCS"]    = &HateFlag{Flag{field, msgsChan}, consts.ORC_RACE}
	flags["HATE_EVILS"]   = &HateFlag{Flag{field, msgsChan}, consts.EVIL_RACE}
	flags["HATE_TROLLS"]  = &HateFlag{Flag{field, msgsChan}, consts.TROLL_RACE}
	flags["HATE_GIANTS"]  = &HateFlag{Flag{field, msgsChan}, consts.GIANT_RACE}
	flags["HATE_DEMONS"]  = &HateFlag{Flag{field, msgsChan}, consts.DEMON_RACE}
	flags["HATE_METALS"]  = &HateFlag{Flag{field, msgsChan}, consts.METAL_RACE}
	flags["HATE_PLAYERS"] = &HateFlag{Flag{field, msgsChan}, consts.PLAYER_RACE}
	flags["HATE_DRAGONS"] = &HateFlag{Flag{field, msgsChan}, consts.DRAGON_RACE}
	flags["HATE_UNDEADS"] = &HateFlag{Flag{field, msgsChan}, consts.UNDEAD_RACE}
	flags["HATE_ANIMALS"] = &HateFlag{Flag{field, msgsChan}, consts.ANIMAL_RACE}

	raceFlags["ORC"] 	= consts.ORC_RACE
	raceFlags["EVIL"] 	= consts.EVIL_RACE
	raceFlags["TROLL"] 	= consts.TROLL_RACE
	raceFlags["GIANT"] 	= consts.GIANT_RACE
	raceFlags["DEMON"] 	= consts.DEMON_RACE
	raceFlags["METAL"] 	= consts.METAL_RACE
	raceFlags["DRAGON"] = consts.DRAGON_RACE
	raceFlags["UNDEAD"] = consts.UNDEAD_RACE
	raceFlags["ANIMAL"] = consts.ANIMAL_RACE
}

func GetFlag(name string) gameObjectsBase.Flager {
	return flags[name]
}
