package consts

import (
    "time"
    "flag"
    "fmt"
)

type JsonType map[string] interface{}

const (
    WALL_SYMBOL = '#'
    GRASS_SYMBOL = '.'
    MOB_TYPE = "mob"
    PLAYER_TYPE = "player"
    ITEM_TYPE = "item"
    SERVER_PORT = ":8080"
	VELOCITY = 0.12
	TICK_DURATION = 50 * time.Millisecond
	DATABASE_TICK_DURATION = 1 * time.Second
	LIVING_AFTER_DEAD_DURATION = 2 * time.Second
	DEFAULT_ATTACK_COOLDOWN = 1
	DEFAULT_PLAYER_POS_X = 5
	DEFAULT_PLAYER_POS_Y = 5
    INITIAL_PLAYER_HP = 100
	VISION_RADIUS = 10
	PATH_TO_MAPS = "resourses/maps/"
	OBJECT_HALF = 0.5
	NORTH_DIR = iota
	SOUTH_DIR
	EAST_DIR
	WEST_DIR
	MOB_WALKING_CYCLE_DURATION = 20
    BT_MELEE = iota
    BT_RANGE
    PICK_UP_RADIUS = 2
)

const (
    NO_RACE = iota
    ORC_RACE
    EVIL_RACE
    TROLL_RACE
    GIANT_RACE
    DEMON_RACE
    METAL_RACE
    DRAGON_RACE
    UNDEAD_RACE
    ANIMAL_RACE
    PLAYER_RACE
)

const (
    FIST_WEAP = "FIST"
)

const (
    ITEM_T_AMULET = iota
    ITEM_T_RING
    ITEM_T_ARMOR
    ITEM_T_SHIELD
    ITEM_T_HELMET
    ITEM_T_GLOVES
    ITEM_T_BOOTS
    ITEM_T_WEAPON
    ITEM_T_POTION
    ITEM_T_SCROLL
    ITEM_ST_DEFAULT = -1
    ITEM_ST_SWORD = iota
    ITEM_ST_POLEARM
    ITEM_ST_BOW
)

const (
    SLOT_WEAPON = iota
    SLOT_LEFT
    SLOT_RIGHT
    SLOT_NECK
    SLOT_BODY
    SLOT_ARM
    SLOT_HEAD
    SLOT_HANDS
    SLOT_FEET
)

var SlotItemMapping = map[int] int {
    SLOT_WEAPON : ITEM_T_WEAPON,
    SLOT_LEFT   : ITEM_T_RING,
    SLOT_RIGHT  : ITEM_T_RING,
    SLOT_NECK   : ITEM_T_AMULET,
    SLOT_BODY   : ITEM_T_ARMOR,
    SLOT_ARM    : ITEM_T_SHIELD,
    SLOT_HEAD   : ITEM_T_HELMET,
    SLOT_HANDS  : ITEM_T_GLOVES,
    SLOT_FEET   : ITEM_T_BOOTS,
}

const (
    SLOT_NAME_WEAPON = "WEAPON"
    SLOT_NAME_LEFT   = "LEFT"
    SLOT_NAME_RIGHT  = "RIGHT"
    SLOT_NAME_NECK   = "NECK"
    SLOT_NAME_BODY   = "BODY"
    SLOT_NAME_ARM    = "ARM"
    SLOT_NAME_HEAD   = "HEAD"
    SLOT_NAME_HANDS  = "HANDS"
    SLOT_NAME_FEET   = "FEET"
)

var NameSlotMapping = map[string] int {
    SLOT_NAME_WEAPON : SLOT_WEAPON,
    SLOT_NAME_LEFT   : SLOT_LEFT,
    SLOT_NAME_RIGHT  : SLOT_RIGHT,
    SLOT_NAME_NECK   : SLOT_NECK,
    SLOT_NAME_BODY   : SLOT_BODY,
    SLOT_NAME_ARM    : SLOT_ARM,
    SLOT_NAME_HEAD   : SLOT_HEAD,
    SLOT_NAME_HANDS  : SLOT_HANDS,
    SLOT_NAME_FEET   : SLOT_FEET,
}

var SlotNameMapping = map[int] string {
    SLOT_WEAPON : SLOT_NAME_WEAPON,
    SLOT_LEFT   : SLOT_NAME_LEFT,
    SLOT_RIGHT  : SLOT_NAME_RIGHT,
    SLOT_NECK   : SLOT_NAME_NECK,
    SLOT_BODY   : SLOT_NAME_BODY,
    SLOT_ARM    : SLOT_NAME_ARM,
    SLOT_HEAD   : SLOT_NAME_HEAD,
    SLOT_HANDS  : SLOT_NAME_HANDS,
    SLOT_FEET   : SLOT_NAME_FEET,
}

)

var (
    TEST = flag.Bool("test", false, "a bool")
    TEST_MODE = false
)

func ParseCommandLine(){
    flag.Parse()
    fmt.Println(*TEST)
}
