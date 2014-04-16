package consts

import (
    "time"
    "flag"
    "fmt"
)

type JsonType map[string] interface{}

const (
    MOB_TYPE = "mob"
    PLAYER_TYPE = "player"
    SERVER_PORT = ":8080"
	VELOCITY = 0.12
	TICK_DURATION = 50 * time.Millisecond
	DATABASE_TICK_DURATION = 1 * time.Second
	LIVING_AFTER_DEAD_DURATION = 3 * time.Second
	DEFAULT_PLAYER_POS_X = 5
	DEFAULT_PLAYER_POS_Y = 5
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
)

const (
	PLAYER = iota
	TROLL
	ORC
)

var (
    TEST = flag.Bool("test", false, "a bool")
    TEST_MODE = false
)

func ParseCommandLine(){
    flag.Parse()
    fmt.Println(*TEST)
}
