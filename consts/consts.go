package consts

import "time"

const (
   SERVER_PORT = ":8080"
	PLAYER_SPEED = 0.2
	TICK_DURATION = 100 * time.Millisecond
	DATABASE_TICK_DURATION = 5 * time.Second
	DEFAULT_PLAYER_POS_X = 5
	DEFAULT_PLAYER_POS_Y = 5
	VISION_RADIUS = 4
	PATH_TO_MAPS = "resourses/maps/"
)
