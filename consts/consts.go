package consts

import (
    "time"
    "flag"
    "fmt"
)

type JsonType map[string] interface{}

const (
    FIREBALL_NAME = "fireball"
)

const (
    DEFAULT_DICE = "0d0"
)

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

const (
    DEFAULT_TICKS_PER_SECOND = 20
    DEFAULT_TICK_DURATION = time.Duration(1000.0 / DEFAULT_TICKS_PER_SECOND) * time.Millisecond
    DEFAULT_VISION_RADIUS = 10
    DEFAULT_SLIDE_THRESHOLD = 0.2
    DEFAULT_VELOCITY = 0.12
    DEFAULT_PICK_UP_RADIUS = 2.0
    DEFAULT_SCREEN_ROW_COUNT_NAME = DEFAULT_VISION_RADIUS
    DEFAULT_SCREEN_COLUMN_COUNT_NAME = DEFAULT_VISION_RADIUS
    DEFAULT_PROJECTILE_VELOCITY = 0.3
)

var (
    TICKS_PER_SECOND = DEFAULT_TICKS_PER_SECOND
    TICK_DURATION = time.Duration(1000.0 / TICKS_PER_SECOND) * time.Millisecond
    VISION_RADIUS = DEFAULT_VISION_RADIUS
    SLIDE_THRESHOLD = DEFAULT_SLIDE_THRESHOLD
    VELOCITY = DEFAULT_VELOCITY
    PICK_UP_RADIUS = DEFAULT_PICK_UP_RADIUS
    SCREEN_ROW_COUNT = DEFAULT_SCREEN_ROW_COUNT_NAME
    SCREEN_COLUMN_COUNT = DEFAULT_SCREEN_COLUMN_COUNT_NAME
    PROJECTILE_VELOCITY = DEFAULT_PROJECTILE_VELOCITY
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
    NO_RACE_NAME = "NO_RACE"
    ORC_RACE_NAME = "ORC"
    EVIL_RACE_NAME = "EVIL"
    TROLL_RACE_NAME = "TROLL"
    GIANT_RACE_NAME = "GIANT"
    DEMON_RACE_NAME = "DEMON"
    METAL_RACE_NAME = "METAL"
    DRAGON_RACE_NAME = "DRAGON"
    UNDEAD_RACE_NAME = "UNDEAD"
    ANIMAL_RACE_NAME = "ANIMAL"
    PLAYER_RACE_NAME = "PLAYER"
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
    ITEM_CLASS_GARMENT_NAME = "garment"
    ITEM_CLASS_CONSUMABLE_NAME = "consumable"
)

var NameItemClassMapping = map[string] int {
    ITEM_CLASS_CONSUMABLE_NAME : ITEM_CLASS_CONSUMABLE,
    ITEM_CLASS_GARMENT_NAME    : ITEM_CLASS_GARMENT,
}

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
)

const ITEM_ST_DEFAULT = -1

const (
    ITEM_ST_ONE_HANDED = iota
    ITEM_ST_TWO_HANDED
    ITEM_ST_BOW
)

const (
    ITEM_T_AMULET_NAME = "amulet"
    ITEM_T_RING_NAME = "ring"
    ITEM_T_ARMOR_NAME = "armor"
    ITEM_T_SHIELD_NAME = "shield"
    ITEM_T_HELMET_NAME = "helm"
    ITEM_T_GLOVES_NAME = "gloves"
    ITEM_T_BOOTS_NAME = "boots"
    ITEM_T_WEAPON_NAME = "weapon"
    ITEM_T_EXPENDABLE_NAME = "expendable"
    ITEM_ST_ONE_HANDED_NAME = "one-handed"
    ITEM_ST_TWO_HANDED_NAME = "two-handed"
    ITEM_ST_BOW_NAME = "bow"
)

var NameItemTypeMapping = map[string] int {
    ITEM_T_AMULET_NAME : ITEM_T_AMULET,
    ITEM_T_RING_NAME : ITEM_T_RING,
    ITEM_T_ARMOR_NAME : ITEM_T_ARMOR,
    ITEM_T_SHIELD_NAME : ITEM_T_SHIELD,
    ITEM_T_HELMET_NAME : ITEM_T_HELMET,
    ITEM_T_GLOVES_NAME : ITEM_T_GLOVES,
    ITEM_T_BOOTS_NAME  : ITEM_T_BOOTS,
    ITEM_T_WEAPON_NAME : ITEM_T_WEAPON,
    ITEM_T_EXPENDABLE_NAME : ITEM_T_EXPENDABLE,
    ITEM_ST_ONE_HANDED_NAME : ITEM_ST_ONE_HANDED,
    ITEM_ST_TWO_HANDED_NAME : ITEM_ST_TWO_HANDED,
    ITEM_ST_BOW_NAME  : ITEM_ST_BOW,
}

const (
    SLOT_LEFT_HAND = iota
    SLOT_RIGHT_HAND
    SLOT_AMMO
    SLOT_LEFT_FINGER
    SLOT_RIGHT_FINGER
    SLOT_WEAPON
    SLOT_NECK
    SLOT_BODY
    SLOT_HEAD
    SLOT_FOREARM
    SLOT_FEET
    SLOT_DEFAULT
)

func it(types ...int) []int {
    res := make([]int, 0)
    for _, v := range types {
        res = append(res, v)
    }
    return res
}

var SlotItemMapping = map[int] []int {
    SLOT_AMMO           : it(ITEM_T_EXPENDABLE),
    SLOT_NECK           : it(ITEM_T_AMULET),
    SLOT_BODY           : it(ITEM_T_ARMOR),
    SLOT_HEAD           : it(ITEM_T_HELMET),
    SLOT_FEET           : it(ITEM_T_BOOTS),
    SLOT_FOREARM        : it(ITEM_T_GLOVES),
    SLOT_LEFT_HAND      : it(ITEM_T_WEAPON, ITEM_T_SHIELD),
    SLOT_RIGHT_HAND     : it(ITEM_T_WEAPON, ITEM_T_SHIELD),
    SLOT_LEFT_FINGER    : it(ITEM_T_RING),
    SLOT_RIGHT_FINGER   : it(ITEM_T_RING),
}

const (
    SLOT_NAME_AMMO         = "ammo"
    SLOT_NAME_FEET         = "feet"
    SLOT_NAME_NECK         = "neck"
    SLOT_NAME_BODY         = "body"
    SLOT_NAME_HEAD         = "head"
    SLOT_NAME_FOREARM      = "forearm"
    SLOT_NAME_LEFT_HAND    = "left-hand"
    SLOT_NAME_RIGHT_HAND   = "right-hand"
    SLOT_NAME_LEFT_FINGER  = "left-finger"
    SLOT_NAME_RIGHT_FINGER = "right-finger"
)

var NameSlotMapping = map[string] int {
    SLOT_NAME_AMMO         : SLOT_AMMO,
    SLOT_NAME_FEET         : SLOT_FEET,
    SLOT_NAME_NECK         : SLOT_NECK,
    SLOT_NAME_BODY         : SLOT_BODY,
    SLOT_NAME_HEAD         : SLOT_HEAD,
    SLOT_NAME_FOREARM      : SLOT_FOREARM,
    SLOT_NAME_LEFT_HAND    : SLOT_LEFT_HAND,
    SLOT_NAME_RIGHT_HAND   : SLOT_RIGHT_HAND,
    SLOT_NAME_LEFT_FINGER  : SLOT_LEFT_FINGER,
    SLOT_NAME_RIGHT_FINGER : SLOT_RIGHT_FINGER,
}

var SlotNameMapping = map[int] string {
    SLOT_AMMO         : SLOT_NAME_AMMO,
    SLOT_FEET         : SLOT_NAME_FEET,
    SLOT_NECK         : SLOT_NAME_NECK,
    SLOT_BODY         : SLOT_NAME_BODY,
    SLOT_HEAD         : SLOT_NAME_HEAD,
    SLOT_FOREARM      : SLOT_NAME_FOREARM,
    SLOT_LEFT_HAND    : SLOT_NAME_LEFT_HAND,
    SLOT_RIGHT_HAND   : SLOT_NAME_RIGHT_HAND,
    SLOT_LEFT_FINGER  : SLOT_NAME_LEFT_FINGER,
    SLOT_RIGHT_FINGER : SLOT_NAME_RIGHT_FINGER,
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
    CHARACTERISTIC_NAME_STRENGTH = "STRENGTH"
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

var NameCharacteristicMapping = map[string] int {
    CHARACTERISTIC_NAME_STRENGTH          : CHARACTERISTIC_STRENGTH,
    CHARACTERISTIC_NAME_INTELLEGENCE      : CHARACTERISTIC_INTELLEGENCE,
    CHARACTERISTIC_NAME_DEXTERITY         : CHARACTERISTIC_DEXTERITY,
    CHARACTERISTIC_NAME_SPEED             : CHARACTERISTIC_SPEED,
    CHARACTERISTIC_NAME_DEFENSE           : CHARACTERISTIC_DEFENSE,
    CHARACTERISTIC_NAME_MAGICK_RESISTANCE : CHARACTERISTIC_MAGICK_RESISTANCE,
    CHARACTERISTIC_NAME_HP                : CHARACTERISTIC_HP,
    CHARACTERISTIC_NAME_MAX_HP            : CHARACTERISTIC_MAX_HP,
    CHARACTERISTIC_NAME_MP                : CHARACTERISTIC_MP,
    CHARACTERISTIC_NAME_MAX_MP            : CHARACTERISTIC_MAX_MP,
    CHARACTERISTIC_NAME_CAPACITY          : CHARACTERISTIC_CAPACITY,
}

const (
    PLAYER_VELOCITY_NAME = "playerVelocity"
    SLIDE_THRESHOLD_NAME = "slideThreshold"
    TICKS_PER_SECOND_NAME = "ticksPerSecond"
    SCREEN_ROW_COUNT_NAME = "screenRowCount"
    SCREEN_COLUMN_COUNT_NAME = "screenColumnCount"
    PICK_UP_RADIUS_NAME = "pickUpRadius"
    PROJECTILE_VELOCITY_NAME = "projectileVelocity"
)

var NameConstMapping = map[string] interface{} {
    PLAYER_VELOCITY_NAME     : &VELOCITY,
    SLIDE_THRESHOLD_NAME     : &SLIDE_THRESHOLD,
    TICKS_PER_SECOND_NAME    : &TICKS_PER_SECOND,
    SCREEN_ROW_COUNT_NAME    : &SCREEN_ROW_COUNT,
    SCREEN_COLUMN_COUNT_NAME : &SCREEN_COLUMN_COUNT,
    PICK_UP_RADIUS_NAME      : &PICK_UP_RADIUS,
    PROJECTILE_VELOCITY_NAME : &PROJECTILE_VELOCITY,
}

var NameDefaultConstMapping = map[string] interface{} {
    PLAYER_VELOCITY_NAME     : DEFAULT_VELOCITY,
    SLIDE_THRESHOLD_NAME     : DEFAULT_SLIDE_THRESHOLD,
    TICKS_PER_SECOND_NAME    : DEFAULT_TICKS_PER_SECOND,
    SCREEN_ROW_COUNT_NAME    : DEFAULT_SCREEN_ROW_COUNT_NAME,
    SCREEN_COLUMN_COUNT_NAME : DEFAULT_SCREEN_COLUMN_COUNT_NAME,
    PICK_UP_RADIUS_NAME      : DEFAULT_PICK_UP_RADIUS,
    PROJECTILE_VELOCITY_NAME : DEFAULT_PROJECTILE_VELOCITY,
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

const (
    BONUS_PERCENT_NAME = "percent"
    BONUS_CONSTANT_NAME = "const"
)

var NameBonusMapping = map[string] int {
    BONUS_PERCENT_NAME  : BONUS_PERCENT,
    BONUS_CONSTANT_NAME : BONUS_CONSTANT,
}

var (
    TEST = flag.Bool("test", false, "a bool")
    TEST_MODE = false
)

func ParseCommandLine(){
    flag.Parse()
    fmt.Println(*TEST)
}

func SetDefaultConstantsValues() {
    for name, addr := range NameConstMapping {
        if p, ok := addr.(*float64); ok {
            *p = NameDefaultConstMapping[name].(float64)
        } else if p, ok := addr.(*int); ok {
            *p = NameDefaultConstMapping[name].(int)
        }
    }
    Refresh()
}

func Refresh() {
    TICK_DURATION = time.Duration(1000.0 / TICKS_PER_SECOND) * time.Millisecond
}
