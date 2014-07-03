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
    ATTACK_RADIUS = 1.4
	DATABASE_TICK_DURATION = 1 * time.Second
	LIVING_AFTER_DEAD_DURATION = 2 * time.Second
	DEFAULT_ATTACK_COOLDOWN = 1
	DEFAULT_PLAYER_POS_X = 5
	DEFAULT_PLAYER_POS_Y = 5
    INITIAL_PLAYER_HP = 100
	PATH_TO_MAPS = "resourses/maps/"
	OBJECT_HALF = 0.5
	MOB_WALKING_CYCLE_DURATION = 20
    BT_MELEE = iota
    BT_RANGE
)

var (
    TICKS_PER_SECOND = 20
    TICK_DURATION = time.Duration(1000.0 / TICKS_PER_SECOND) * time.Millisecond
    VISION_RADIUS = 10
    SLIDE_THRESHOLD = 0.2
    VELOCITY = 0.12
    PICK_UP_RADIUS = 2.0
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
    NO_RACE_NAME = "noRace"
    ORC_RACE_NAME = "orc"
    EVIL_RACE_NAME = "evil"
    TROLL_RACE_NAME = "troll"
    GIANT_RACE_NAME = "giant"
    DEMON_RACE_NAME = "demon"
    METAL_RACE_NAME = "metal"
    DRAGON_RACE_NAME = "dragon"
    UNDEAD_RACE_NAME = "undead"
    ANIMAL_RACE_NAME = "animal"
    PLAYER_RACE_NAME = "player"
)

var NameRaceMapping = map[string] int {
    NO_RACE_NAME : NO_RACE,
    ORC_RACE_NAME : ORC_RACE,
    EVIL_RACE_NAME : EVIL_RACE,
    TROLL_RACE_NAME : TROLL_RACE,
    GIANT_RACE_NAME : GIANT_RACE,
    DEMON_RACE_NAME : DEMON_RACE,
    METAL_RACE_NAME : METAL_RACE,
    DRAGON_RACE_NAME : DRAGON_RACE,
    UNDEAD_RACE_NAME : UNDEAD_RACE,
    ANIMAL_RACE_NAME : ANIMAL_RACE,
    PLAYER_RACE_NAME : PLAYER_RACE,
}

const (
    FIST_ID = -1
    FIST_WEAP = "FIST"
)

const (
    ITEM_CLASS_GARMENT = iota
    ITEM_CLASS_CONSUMABLE
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
    ITEM_T_EXPENDABLE
    ITEM_ST_DEFAULT = -1
    ITEM_ST_ONE_HANDED = iota
    ITEM_ST_TWO_HANDED
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

const (
    CHARACTERISTIC_STRENGTH = iota
    CHARACTERISTIC_INTELLEGENCE
    CHARACTERISTIC_DEXTERITY
    CHARACTERISTIC_SPEED
    CHARACTERISTIC_DEFENSE
    CHARACTERISTIC_MAGICK_RESISTANCE
    CHARACTERISTIC_HP
    CHARACTERISTIC_MAX_HP
    CHARACTERISTIC_MP
    CHARACTERISTIC_MAX_MP
    CHARACTERISTIC_CAPACITY
    CHARACTERISTICS_COUNT
)

const (
    HP_MULTIPLIER = 60
    MP_MULTIPLIER = 50
    CAPACITY_MULTIPLIER = 50
)

const (
    DEFAULT_STRENGTH = 10
    DEFAULT_INTELLEGENCE = 10
    DEFAULT_DEXTERITY = 10
    DEFAULT_SPEED = 25
    DEFAULT_DEFENSE = 10
    DEFAULT_MAGICK_RESISTANCE = 10
    DEFAULT_MAX_HP = HP_MULTIPLIER * DEFAULT_STRENGTH
    DEFAULT_MAX_MP = MP_MULTIPLIER * DEFAULT_INTELLEGENCE
    DEFAULT_HP = DEFAULT_MAX_HP
    DEFAULT_MP = DEFAULT_MAX_MP
    DEFAULT_CAPACITY = CAPACITY_MULTIPLIER * DEFAULT_STRENGTH
)

var CharacteristicDefaultValueMapping = map[int] int {
    CHARACTERISTIC_STRENGTH          : DEFAULT_STRENGTH,
    CHARACTERISTIC_INTELLEGENCE      : DEFAULT_INTELLEGENCE,
    CHARACTERISTIC_DEXTERITY         : DEFAULT_DEXTERITY,
    CHARACTERISTIC_SPEED             : DEFAULT_SPEED,
    CHARACTERISTIC_DEFENSE           : DEFAULT_DEFENSE,
    CHARACTERISTIC_MAGICK_RESISTANCE : DEFAULT_MAGICK_RESISTANCE,
    CHARACTERISTIC_HP                : DEFAULT_HP,
    CHARACTERISTIC_MAX_HP            : DEFAULT_MAX_HP,
    CHARACTERISTIC_MP                : DEFAULT_MP,
    CHARACTERISTIC_MAX_MP            : DEFAULT_MAX_MP,
    CHARACTERISTIC_CAPACITY          : DEFAULT_CAPACITY,
}

const (
    CHARACTERISTIC_NAME_STRENGTH = "STREANGTH"
    CHARACTERISTIC_NAME_INTELLEGENCE = "INTELLIGENCE"
    CHARACTERISTIC_NAME_DEXTERITY = "DEXTERITY"
    CHARACTERISTIC_NAME_SPEED = "SPEED"
    CHARACTERISTIC_NAME_DEFENSE = "DEFENSE"
    CHARACTERISTIC_NAME_MAGICK_RESISTANCE = "MAGIC_RESISTANCE"
    CHARACTERISTIC_NAME_HP = "HP"
    CHARACTERISTIC_NAME_MAX_HP = "MAX_HP"
    CHARACTERISTIC_NAME_MP = "MP"
    CHARACTERISTIC_NAME_MAX_MP = "MAX_MP"
    CHARACTERISTIC_NAME_CAPACITY = "CAPACITY"
)

var CharacteristicNameMapping = map[int] string {
    CHARACTERISTIC_STRENGTH          : CHARACTERISTIC_NAME_STRENGTH,
    CHARACTERISTIC_INTELLEGENCE      : CHARACTERISTIC_NAME_INTELLEGENCE,
    CHARACTERISTIC_DEXTERITY         : CHARACTERISTIC_NAME_DEXTERITY,
    CHARACTERISTIC_SPEED             : CHARACTERISTIC_NAME_SPEED,
    CHARACTERISTIC_DEFENSE           : CHARACTERISTIC_NAME_DEFENSE,
    CHARACTERISTIC_MAGICK_RESISTANCE : CHARACTERISTIC_NAME_MAGICK_RESISTANCE,
    CHARACTERISTIC_HP                : CHARACTERISTIC_NAME_HP,
    CHARACTERISTIC_MAX_HP            : CHARACTERISTIC_NAME_MAX_HP,
    CHARACTERISTIC_MP                : CHARACTERISTIC_NAME_MP,
    CHARACTERISTIC_MAX_MP            : CHARACTERISTIC_NAME_MAX_MP,
    CHARACTERISTIC_CAPACITY          : CHARACTERISTIC_NAME_CAPACITY,
}

const (
    PLAYER_VELOCITY_NAME = "playerVelocity"
    SLIDE_THRESHOLD_NAME = "slideThreshold"
    TICKS_PER_SECOND_NAME = "ticksPerSecond"
    SCREEN_ROW_COUNT_NAME = "screenRowCount"
    SCREEN_COLUMN_COUNT_NAME = "screenColumnCount"
    PICK_UP_RADIUS_NAME = "pickUpRadius"
)

var NameConstMapping = map[string] interface{} {
    PLAYER_VELOCITY_NAME     : &VELOCITY,
    SLIDE_THRESHOLD_NAME     : &SLIDE_THRESHOLD,
    TICKS_PER_SECOND_NAME    : &TICKS_PER_SECOND,
    SCREEN_ROW_COUNT_NAME    : &VISION_RADIUS,
    SCREEN_COLUMN_COUNT_NAME : &VISION_RADIUS,
    PICK_UP_RADIUS_NAME      : &PICK_UP_RADIUS,
}

const (
    NORTH_DIR = iota
    SOUTH_DIR
    EAST_DIR
    WEST_DIR
)

const (
    WEST_DIR_NAME = "west"
    EAST_DIR_NAME = "east"
    NORTH_DIR_NAME = "north"
    SOUTH_DIR_NAME = "south"
)

var NameDirMapping = map[string] int {
    WEST_DIR_NAME : WEST_DIR,
    EAST_DIR_NAME : EAST_DIR,
    NORTH_DIR_NAME : NORTH_DIR,
    SOUTH_DIR_NAME : SOUTH_DIR,
}


const (
    BONUS_PERCENT = iota
    BONUS_CONSTANT
)

var (
    TEST = flag.Bool("test", false, "a bool")
    TEST_MODE = false
)

func ParseCommandLine(){
    flag.Parse()
    fmt.Println(*TEST)
}

func Refresh() {
    TICK_DURATION = time.Duration(1000.0 / TICKS_PER_SECOND) * time.Millisecond
}
