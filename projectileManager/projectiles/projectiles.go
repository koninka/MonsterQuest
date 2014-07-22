package projectiles

import (
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/geometry"
)

type Projectiler interface {
    gameObjectsBase.GameObjecter
    GetDestination() geometry.Point
    GetDamage() int
}

type Projectile struct {
    gameObjectsBase.GameObject
    Destination geometry.Point
    DealtDamage int
}

func (p *Projectile) GetDestination() geometry.Point {
    return p.Destination
}

func (p *Projectile) GetDamage() int {
    return p.DealtDamage
}

func NewProjectile(id int64, start, finish *geometry.Point, damage int) *Projectile {
    return &Projectile{
        gameObjectsBase.NewGameObject(id, *start),
        *finish,
        damage,
    }
}

type AreaDamageProjectile struct {
    Projectile
    Radius int
}

func NewAreaDamageProjectile(id int64, start, finish *geometry.Point, damage, radius int) *AreaDamageProjectile {
    return &AreaDamageProjectile{
        *NewProjectile(id, start, finish, damage),
        radius,
    }
}
