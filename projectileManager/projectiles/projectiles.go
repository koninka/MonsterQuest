package projectiles

import (
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
)

type Projectiler interface {
    gameObjectsBase.GameObjecter
    GetDestination() geometry.Point
    GetDamage() int
    GetOwner() gameObjectsBase.Activer
}

type Projectile struct {
    gameObjectsBase.GameObject
    Destination geometry.Point
    DealtDamage int
    Owner gameObjectsBase.Activer
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

func NewProjectile(id int64, start, finish *geometry.Point, damage int, owner gameObjectsBase.Activer) *Projectile {
    return &Projectile{
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

func NewAreaDamageProjectile(id int64, start, finish *geometry.Point, damage, radius int, owner gameObjectsBase.Activer) *AreaDamageProjectile {
    return &AreaDamageProjectile{
        *NewProjectile(id, start, finish, damage, owner),
        radius,
    }
}
