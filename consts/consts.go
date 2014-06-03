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
    ITEM_WEAPON = iota
    ITEM_RING
    ITEM_AMULET
    ITEM_ARMOR
    ITEM_SHIELD
    ITEM_HELMET
    ITEM_BOOTS
    ITEM_GLOVES
    ITEM_POTION
    ITEM_SCROLL
    PATH_SEGMENT_DURATION_IN_TICKS = 20
    ACCEPTABLE_DISTANCE_DELTA = 0.2
    AXIS_X = iota
    AXIS_Y
)

var (
    TEST = flag.Bool("test", false, "a bool")
    TEST_MODE = false
)

func ParseCommandLine(){
    flag.Parse()
    fmt.Println(*TEST)
}
