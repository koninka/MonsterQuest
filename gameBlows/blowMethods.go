package gameBlows

import "fmt"

type Blower interface {
    isRange() bool
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

func (bb *BaseBlow) isRange() bool {
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
    blowMethods["HIT"]    = &BlowHit{BaseBlow{bmHIT, 0.8, "hit"}}
    blowMethods["BEG"]    = &BlowBeg{BaseBlow{bmBEG, 0.8, "beg"}}
    blowMethods["KICK"]   = &BlowKick{BaseBlow{bmKICK, 0.8, "kick"}}
    blowMethods["CLAW"]   = &BlowClaw{BaseBlow{bmCLAW, 0.8, "claw"}}
    blowMethods["BITE"]   = &BlowBite{BaseBlow{bmBITE, 0.8, "bite"}}
    blowMethods["BUTT"]   = &BlowButt{BaseBlow{bmBUTT, 0.8, "butt"}}
    blowMethods["SPIT"]   = &BlowSpit{BaseBlow{bmSPIT, 5.5, "spit"}} //range, плевок
    blowMethods["GAZE"]   = &BlowGaze{BaseBlow{bmGAZE, 0.8, "gaze"}}
    blowMethods["WAIL"]   = &BlowWail{BaseBlow{bmWAIL, 9, "wail"}} //may be range, вопль - вой
    blowMethods["NONE"]   = &BlowNone{BaseBlow{bmNONE, 0.0, "none"}}
    blowMethods["MOAN"]   = &BlowMoan{BaseBlow{bmMOAN, 8, "moan"}} //range, стон
    blowMethods["STING"]  = &BlowSting{BaseBlow{bmSTING, 0.7, "sting"}} //жало, укус, укол
    blowMethods["CRUSH"]  = &BlowCrush{BaseBlow{bmCRUSH, 0.7, "crush"}}
    blowMethods["TOUCH"]  = &BlowTouch{BaseBlow{bmTOUCH, 0.7, "touch"}}
    blowMethods["PUNCH"]  = &BlowPunch{BaseBlow{bmPUNCH, 0.7, "punch"}}
    blowMethods["CRAWL"]  = &BlowCrawl{BaseBlow{bmCRAWL, 0.7, "crawl"}}
    blowMethods["DROOL"]  = &BlowDrool{BaseBlow{bmDROOL, 0.7, "drool"}}
    blowMethods["SPORE"]  = &BlowSpore{BaseBlow{bmSPORE, 0.7, "spore"}}
    blowMethods["ENGULF"] = &BlowEngulf{BaseBlow{bmENGULF, 0.5, "engulf"}}
    blowMethods["INSULT"] = &BlowInsult{BaseBlow{bmINSULT, 0.5, "insult"}}
}

func GetBlowMethod(name string) Blower {
    if r, ok := blowMethods[name]; ok {
        return r
    } else {
        fmt.Println("blow NONE")
        return blowMethods["NONE"]
    }
}
