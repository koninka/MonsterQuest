package gameBlows

import "MonsterQuest/consts"

//general consts
const (
    BT_MELEE = consts.BT_MELEE
    BT_RANGE = consts.BT_RANGE
)

//blow methods const
const (
    BM_NONE = iota
    BM_HIT
    BM_TOUCH
    BM_PUNCH
    BM_KICK
    BM_CLAW
    BM_BITE
    BM_STING
    BM_BUTT
    BM_CRUSH
    BM_ENGULF
    BM_CRAWL
    BM_DROOL
    BM_SPIT
    BM_GAZE
    BM_WAIL
    BM_SPORE
    BM_BEG
    BM_INSULT
    BM_MOAN
)

//blow effects const
const (
    BE_NONE = iota
    BE_HURT
)