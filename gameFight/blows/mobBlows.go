package mobBlows

import (
    "fmt"
    "MonsterQuest/gameFight/fightBase"
)

type MobBlowMethod struct {
}

type MobBlow struct {
    fightBase.BaseBlow
}

var mobBlows map[string] fightBase.Blower = make(map[string] fightBase.Blower)

func InitMobBlows() {
    mobBlows["HIT"]    = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_HIT, 0.8, "hit")}
    mobBlows["BEG"]    = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_BEG, 0.8, "beg")}
    mobBlows["KICK"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_KICK, 0.8, "kick")}
    mobBlows["CLAW"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_CLAW, 0.8, "claw")}
    mobBlows["BITE"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_BITE, 0.8, "bite")}
    mobBlows["BUTT"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_BUTT, 0.8, "butt")}
    mobBlows["SPIT"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_SPIT, 5.5, "spit")} //range, плевок
    mobBlows["GAZE"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_GAZE, 0.8, "gaze")}
    mobBlows["WAIL"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_WAIL, 9, "wail")} //may be range, вопль - вой
    mobBlows["NONE"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_NONE, 0.0, "none")}
    mobBlows["MOAN"]   = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_MOAN, 8, "moan")} //range, стон
    mobBlows["STING"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_STING, 0.7, "sting")} //жало, укус, укол
    mobBlows["CRUSH"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_CRUSH, 0.7, "crush")}
    mobBlows["TOUCH"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_TOUCH, 0.7, "touch")}
    mobBlows["PUNCH"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_PUNCH, 0.7, "punch")}
    mobBlows["CRAWL"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_CRAWL, 0.7, "crawl")}
    mobBlows["DROOL"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_DROOL, 0.7, "drool")}
    mobBlows["SPORE"]  = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_SPORE, 0.7, "spore")}
    mobBlows["ENGULF"] = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_ENGULF, 0.5, "engulf")}
    mobBlows["INSULT"] = &MobBlow{fightBase.NewBaseBlow(fightBase.BM_INSULT, 0.5, "insult")}
}

func getMobBlow(name string) fightBase.Blower {
    if r, ok := mobBlows[name]; ok {
        return r
    } else {
        fmt.Println("blow NONE")
        return mobBlows["NONE"]
    }
}

func NewBlow(blow_damage, blow_name string) fightBase.Blower {
    return &MobBlow(getMobBlow(blow_name))
    bl.addBlow(&BlowDescription{fightBase.CreateDmgDescription(blow_damage), blows.GetBlowMethod(blow_name)})
}
