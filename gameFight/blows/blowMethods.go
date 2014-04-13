package blows

import (
    "fmt"
    fc "MonsterQuest/gameFight/fightConsts"
)

type Blower interface {
    IsRange() bool
    GetBlowRadius() float64
    GetType() string
}

type BaseBlow struct {
    blowType   int
    blowRadius float64
    typeName   string
}

type BlowNone struct {
    BaseBlow
}

type BlowHit struct {
    BaseBlow
}

type BlowTouch struct {
    BaseBlow
}

type BlowPunch struct {
    BaseBlow
}

type BlowKick struct {
    BaseBlow
}

type BlowClaw struct {
    BaseBlow
}

type BlowBite struct {
    BaseBlow
}

type BlowSting struct {
    BaseBlow
}

type BlowButt struct {
    BaseBlow
}

type BlowCrush struct {
    BaseBlow
}

type BlowEngulf struct {
    BaseBlow
}

type BlowCrawl struct { //crawl on you
    BaseBlow
}

type BlowDrool struct { //drool on you
    BaseBlow
}

type BlowSpit struct {
    BaseBlow
}

type BlowGaze struct {
    BaseBlow
}

type BlowWail struct {
    BaseBlow
}

type BlowSpore struct {
    BaseBlow
}

type BlowBeg struct {
    BaseBlow
}

type BlowInsult struct {
    BaseBlow
}

type BlowMoan struct {
    BaseBlow
}

func (bb *BaseBlow) IsRange() bool {
    return bb.blowRadius > 1.0
}

func (bb *BaseBlow) GetBlowRadius() float64 {
    return bb.blowRadius
}

func (bb *BaseBlow) GetType() string {
    return bb.typeName
}

var blowMethods map[string] Blower = make(map[string] Blower)

func InitBlowMethods() {
    blowMethods["HIT"]    = &BlowHit{BaseBlow{fc.BM_HIT, 0.8, "hit"}}
    blowMethods["BEG"]    = &BlowBeg{BaseBlow{fc.BM_BEG, 0.8, "beg"}}
    blowMethods["KICK"]   = &BlowKick{BaseBlow{fc.BM_KICK, 0.8, "kick"}}
    blowMethods["CLAW"]   = &BlowClaw{BaseBlow{fc.BM_CLAW, 0.8, "claw"}}
    blowMethods["BITE"]   = &BlowBite{BaseBlow{fc.BM_BITE, 0.8, "bite"}}
    blowMethods["BUTT"]   = &BlowButt{BaseBlow{fc.BM_BUTT, 0.8, "butt"}}
    blowMethods["SPIT"]   = &BlowSpit{BaseBlow{fc.BM_SPIT, 5.5, "spit"}} //range, плевок
    blowMethods["GAZE"]   = &BlowGaze{BaseBlow{fc.BM_GAZE, 0.8, "gaze"}}
    blowMethods["WAIL"]   = &BlowWail{BaseBlow{fc.BM_WAIL, 9, "wail"}} //may be range, вопль - вой
    blowMethods["NONE"]   = &BlowNone{BaseBlow{fc.BM_NONE, 0.0, "none"}}
    blowMethods["MOAN"]   = &BlowMoan{BaseBlow{fc.BM_MOAN, 8, "moan"}} //range, стон
    blowMethods["STING"]  = &BlowSting{BaseBlow{fc.BM_STING, 0.7, "sting"}} //жало, укус, укол
    blowMethods["CRUSH"]  = &BlowCrush{BaseBlow{fc.BM_CRUSH, 0.7, "crush"}}
    blowMethods["TOUCH"]  = &BlowTouch{BaseBlow{fc.BM_TOUCH, 0.7, "touch"}}
    blowMethods["PUNCH"]  = &BlowPunch{BaseBlow{fc.BM_PUNCH, 0.7, "punch"}}
    blowMethods["CRAWL"]  = &BlowCrawl{BaseBlow{fc.BM_CRAWL, 0.7, "crawl"}}
    blowMethods["DROOL"]  = &BlowDrool{BaseBlow{fc.BM_DROOL, 0.7, "drool"}}
    blowMethods["SPORE"]  = &BlowSpore{BaseBlow{fc.BM_SPORE, 0.7, "spore"}}
    blowMethods["ENGULF"] = &BlowEngulf{BaseBlow{fc.BM_ENGULF, 0.5, "engulf"}}
    blowMethods["INSULT"] = &BlowInsult{BaseBlow{fc.BM_INSULT, 0.5, "insult"}}
}

func GetBlowMethod(name string) Blower {
    if r, ok := blowMethods[name]; ok {
        return r
    } else {
        fmt.Println("blow NONE")
        return blowMethods["NONE"]
    }
}
