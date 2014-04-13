package blows

import (
    "fmt"
    "MonsterQuest/gameFight/fightBase"
)

type BlowNone struct {
    fightBase.BaseBlow
}

type BlowHit struct {
    fightBase.BaseBlow
}

type BlowTouch struct {
    fightBase.BaseBlow
}

type BlowPunch struct {
    fightBase.BaseBlow
}

type BlowKick struct {
    fightBase.BaseBlow
}

type BlowClaw struct {
    fightBase.BaseBlow
}

type BlowBite struct {
    fightBase.BaseBlow
}

type BlowSting struct {
    fightBase.BaseBlow
}

type BlowButt struct {
    fightBase.BaseBlow
}

type BlowCrush struct {
    fightBase.BaseBlow
}

type BlowEngulf struct {
    fightBase.BaseBlow
}

type BlowCrawl struct { //crawl on you
    fightBase.BaseBlow
}

type BlowDrool struct { //drool on you
    fightBase.BaseBlow
}

type BlowSpit struct {
    fightBase.BaseBlow
}

type BlowGaze struct {
    fightBase.BaseBlow
}

type BlowWail struct {
    fightBase.BaseBlow
}

type BlowSpore struct {
    fightBase.BaseBlow
}

type BlowBeg struct {
    fightBase.BaseBlow
}

type BlowInsult struct {
    fightBase.BaseBlow
}

type BlowMoan struct {
    fightBase.BaseBlow
}

var blowMethods map[string] fightBase.Blower = make(map[string] fightBase.Blower)

func InitBlowMethods() {
    blowMethods["HIT"]    = &BlowHit{fightBase.NewBaseBlow(fightBase.BM_HIT, 0.8, "hit")}
    blowMethods["BEG"]    = &BlowBeg{fightBase.NewBaseBlow(fightBase.BM_BEG, 0.8, "beg")}
    blowMethods["KICK"]   = &BlowKick{fightBase.NewBaseBlow(fightBase.BM_KICK, 0.8, "kick")}
    blowMethods["CLAW"]   = &BlowClaw{fightBase.NewBaseBlow(fightBase.BM_CLAW, 0.8, "claw")}
    blowMethods["BITE"]   = &BlowBite{fightBase.NewBaseBlow(fightBase.BM_BITE, 0.8, "bite")}
    blowMethods["BUTT"]   = &BlowButt{fightBase.NewBaseBlow(fightBase.BM_BUTT, 0.8, "butt")}
    blowMethods["SPIT"]   = &BlowSpit{fightBase.NewBaseBlow(fightBase.BM_SPIT, 5.5, "spit")} //range, плевок
    blowMethods["GAZE"]   = &BlowGaze{fightBase.NewBaseBlow(fightBase.BM_GAZE, 0.8, "gaze")}
    blowMethods["WAIL"]   = &BlowWail{fightBase.NewBaseBlow(fightBase.BM_WAIL, 9, "wail")} //may be range, вопль - вой
    blowMethods["NONE"]   = &BlowNone{fightBase.NewBaseBlow(fightBase.BM_NONE, 0.0, "none")}
    blowMethods["MOAN"]   = &BlowMoan{fightBase.NewBaseBlow(fightBase.BM_MOAN, 8, "moan")} //range, стон
    blowMethods["STING"]  = &BlowSting{fightBase.NewBaseBlow(fightBase.BM_STING, 0.7, "sting")} //жало, укус, укол
    blowMethods["CRUSH"]  = &BlowCrush{fightBase.NewBaseBlow(fightBase.BM_CRUSH, 0.7, "crush")}
    blowMethods["TOUCH"]  = &BlowTouch{fightBase.NewBaseBlow(fightBase.BM_TOUCH, 0.7, "touch")}
    blowMethods["PUNCH"]  = &BlowPunch{fightBase.NewBaseBlow(fightBase.BM_PUNCH, 0.7, "punch")}
    blowMethods["CRAWL"]  = &BlowCrawl{fightBase.NewBaseBlow(fightBase.BM_CRAWL, 0.7, "crawl")}
    blowMethods["DROOL"]  = &BlowDrool{fightBase.NewBaseBlow(fightBase.BM_DROOL, 0.7, "drool")}
    blowMethods["SPORE"]  = &BlowSpore{fightBase.NewBaseBlow(fightBase.BM_SPORE, 0.7, "spore")}
    blowMethods["ENGULF"] = &BlowEngulf{fightBase.NewBaseBlow(fightBase.BM_ENGULF, 0.5, "engulf")}
    blowMethods["INSULT"] = &BlowInsult{fightBase.NewBaseBlow(fightBase.BM_INSULT, 0.5, "insult")}
}

func GetBlowMethod(name string) fightBase.Blower {
    if r, ok := blowMethods[name]; ok {
        return r
    } else {
        fmt.Println("blow NONE")
        return blowMethods["NONE"]
    }
}
