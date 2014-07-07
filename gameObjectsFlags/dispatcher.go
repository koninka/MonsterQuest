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

    flags["HATE_ORC"]    = &HateFlag{Flag{field, msgsChan}, consts.ORC_RACE}
    flags["HATE_EVIL"]   = &HateFlag{Flag{field, msgsChan}, consts.EVIL_RACE}
    flags["HATE_TROLL"]  = &HateFlag{Flag{field, msgsChan}, consts.TROLL_RACE}
    flags["HATE_GIANT"]  = &HateFlag{Flag{field, msgsChan}, consts.GIANT_RACE}
    flags["HATE_DEMON"]  = &HateFlag{Flag{field, msgsChan}, consts.DEMON_RACE}
    flags["HATE_METAL"]  = &HateFlag{Flag{field, msgsChan}, consts.METAL_RACE}
    flags["HATE_PLAYER"] = &HateFlag{Flag{field, msgsChan}, consts.PLAYER_RACE}
    flags["HATE_DRAGON"] = &HateFlag{Flag{field, msgsChan}, consts.DRAGON_RACE}
    flags["HATE_UNDEAD"] = &HateFlag{Flag{field, msgsChan}, consts.UNDEAD_RACE}
    flags["HATE_ANIMAL"] = &HateFlag{Flag{field, msgsChan}, consts.ANIMAL_RACE}

    raceFlags["ORC"]    = consts.ORC_RACE
    raceFlags["EVIL"]   = consts.EVIL_RACE
    raceFlags["TROLL"]  = consts.TROLL_RACE
    raceFlags["GIANT"]  = consts.GIANT_RACE
    raceFlags["DEMON"]  = consts.DEMON_RACE
    raceFlags["METAL"]  = consts.METAL_RACE
    raceFlags["DRAGON"] = consts.DRAGON_RACE
    raceFlags["UNDEAD"] = consts.UNDEAD_RACE
    raceFlags["ANIMAL"] = consts.ANIMAL_RACE
}

func CheckFlags(flagsNames [] interface{}) bool {
    for _, flagName := range flagsNames {
        if flags[flagName.(string)] == nil {
            return false
        }
    }
    return true
}

func GetFlag(name string) gameObjectsBase.Flager {
    return flags[name]
}

func GetRaceFlag(name string) (int, bool) {
    r, isExist := raceFlags[name]
    return r, isExist
}