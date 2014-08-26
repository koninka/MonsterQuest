package blows

import (
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameFight/fightUtils"
)

type MobBlowType struct {
    fightBase.BaseBlow
}

type MobBlow struct {
    fightBase.BaseBlow
    dmg fightUtils.DmgDescription
    tp fightBase.Blower
}

var mobBlowsType map[string] fightBase.Blower = make(map[string] fightBase.Blower)

func InitMobBlows() {
    mobBlowsType["HIT"]    = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_HIT, 1.0, "hit")}
    mobBlowsType["BEG"]    = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_BEG, 0.8, "beg")}
    mobBlowsType["KICK"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_KICK, 0.8, "kick")}
    mobBlowsType["CLAW"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_CLAW, 0.8, "claw")}
    mobBlowsType["BITE"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_BITE, 1.0, "bite")}
    mobBlowsType["BUTT"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_BUTT, 0.8, "butt")}
    mobBlowsType["SPIT"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_SPIT, 5.5, "spit")} //range, плевок
    mobBlowsType["GAZE"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_GAZE, 0.8, "gaze")}
    mobBlowsType["WAIL"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_WAIL, 9, "wail")} //may be range, вопль - вой
    mobBlowsType["NONE"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_NONE, 0.0, "none")}
    mobBlowsType["MOAN"]   = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_MOAN, 8, "moan")} //range, стон
    mobBlowsType["STING"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_STING, 0.7, "sting")} //жало, укус, укол
    mobBlowsType["CRUSH"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_CRUSH, 0.7, "crush")}
    mobBlowsType["TOUCH"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_TOUCH, 0.7, "touch")}
    mobBlowsType["PUNCH"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_PUNCH, 0.7, "punch")}
    mobBlowsType["CRAWL"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_CRAWL, 0.7, "crawl")}
    mobBlowsType["DROOL"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_DROOL, 0.7, "drool")}
    mobBlowsType["SPORE"]  = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_SPORE, 1.0, "spore")}
    mobBlowsType["ENGULF"] = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_ENGULF, 0.5, "engulf")}
    mobBlowsType["INSULT"] = &MobBlowType{fightBase.NewBaseBlow(fightBase.BM_INSULT, 0.5, "insult")}
}

func getMobBlowType(name string) fightBase.Blower {
    if r, ok := mobBlowsType[name]; ok {
        return r
    } else {
        return mobBlowsType["NONE"]
    }
}

func NewMobBlow(blow_damage, blow_type_name string) fightBase.Blower {
    return &MobBlow{dmg: fightUtils.CreateDmgDescription(blow_damage), tp: getMobBlowType(blow_type_name)};
}

func (mb *MobBlow) GetDamage() int {
    return mb.dmg.GetDamage()
}
