package projectiles

import (
    "math"
    "MonsterQuest/gameFight/fightBase"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
)

type Projectiler interface {
    fightBase.Blower
    gameObjectsBase.GameObjecter
    GetDestination() geometry.Point
    GetOwner() gameObjectsBase.Activer
}

type Projectile struct {
    fightBase.BaseBlow
    gameObjectsBase.GameObject
    Destination geometry.Point
    DealtDamage int
    Owner gameObjectsBase.Activer
}

func (p *Projectile) GetRectangle() geometry.Rectangle {
    return geometry.Rectangle{ p.GetCenter(), p.GetCenter() }
}

func (p *Projectile) GetDestination() geometry.Point {
    return p.Destination
}

func (p *Projectile) GetDamage() int {
    return p.DealtDamage
}

func (p *Projectile) GetOwner() gameObjectsBase.Activer {
    return p.Owner
}

func (p *Projectile) GetInfo() consts.JsonType {
    info := p.GameObject.GetInfo()
    info["type"] = consts.PROJECTILE_TYPE
    return info
}

func (p *Projectile) GetFullInfo() consts.JsonType {
    return p.GetInfo()
}

func NewProjectile(id int64, start, finish *geometry.Point, damage int, prange float64, owner gameObjectsBase.Activer) *Projectile {
    shift := math.Sqrt(2) / 2 + 1e-2
    alpha := math.Atan2(finish.Y - start.Y, finish.X - start.X)
    start.Move(shift * math.Cos(alpha), shift * math.Sin(alpha))
    return &Projectile{
        fightBase.NewBaseBlow(fightBase.BM_HIT, prange, "hit"),
        gameObjectsBase.NewGameObject(id, *start),
        *finish,
        damage,
        owner,
    }
}

type AreaDamageProjectile struct {
    Projectile
    Radius int
}

type ArrowProjectile struct {
    Projectile
}

func (p *AreaDamageProjectile) GetInfo() consts.JsonType {
    info := p.Projectile.GetInfo()
    info["name"] = consts.FIREBALL_NAME
    return info
}

func (p *ArrowProjectile) GetInfo() consts.JsonType {
    info := p.Projectile.GetInfo()
    info["name"] = consts.ARROW_NAME
    return info
}

func NewArrowProjectile(id int64, start, finish *geometry.Point, damage int, owner gameObjectsBase.Activer) *ArrowProjectile {
    return &ArrowProjectile{*NewProjectile(id, start, finish, damage, consts.ARROW_RANGE, owner)}
}

func NewAreaDamageProjectile(id int64, start, finish *geometry.Point, damage, radius int, owner gameObjectsBase.Activer) *AreaDamageProjectile {
    return &AreaDamageProjectile{
        *NewProjectile(id, start, finish, damage, consts.FIREBALL_RANGE, owner),
        radius,
    }
}
