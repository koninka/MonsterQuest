package fightBase

type Blower interface {
    IsRange() bool
    GetBlowRadius() float64
    GetBlowType() string
    GetDamage() int
}

type BaseBlow struct {
    blowType   int
    blowRadius float64
    typeName   string
}

func NewBaseBlow(bt int, br float64, tn string) BaseBlow {
    return BaseBlow{bt, br, tn}
}

func (bb *BaseBlow) IsRange() bool {
    return bb.blowRadius > 1.0
}

func (bb *BaseBlow) GetBlowRadius() float64 {
    return bb.blowRadius
}

func (bb *BaseBlow) GetBlowType() string {
    return bb.typeName
}

func (bb *BaseBlow) GetDamage() int {
    return 0
}