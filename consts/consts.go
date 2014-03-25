package consts

import "time"

const (
   SERVER_PORT = ":8080"
	VELOCITY = 0.12
	TICK_DURATION = 100 * time.Millisecond
	DATABASE_TICK_DURATION = 1 * time.Second
	DEFAULT_PLAYER_POS_X = 5
	DEFAULT_PLAYER_POS_Y = 5
	VISION_RADIUS = 5
	PATH_TO_MAPS = "resourses/maps/"
	OBJECT_HALF = 0.5
)