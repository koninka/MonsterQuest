package projectileManager

import (
    "math"
    "MonsterQuest/gameMap"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
    "MonsterQuest/utils"
    pM "MonsterQuest/projectileManager/projectiles"
)

type ProjectileManager struct {
    field *gameMap.GameField
    projectiles map[int64] pM.Projectiler
}

func (pm *ProjectileManager) Do() {
    for _, p := range pm.projectiles {
        var shift float64
        d := geometry.Distance(p.Center, p.Destination)
        if d > consts.PROJECTILE_VELOCITY {
            shift = consts.PROJECTILE_VELOCITY
        } else {
            shift = d
        }
        x := p.Destination.X - p.Center.X
        y := p.Destination.Y - p.Center.Y
        norm := math.Sqrt(x * x + y * y)
        dx := x * shift / norm
        dy := y * shift / norm
        p.Move(dx, dy)
        if collisionOccured, actor := pm.CheckCollision(); collisionOccured {
            if p.(*pM.AreaDamageProjectile) != nil {
                
            } else {
                if actor != nil {
                    // actor.GetHit(???)
                }
            }
        }
    }
}

func (pm *ProjectileManager) NewArrowProjectile(start, finish *geometry.Point, damage int) {
    pm.projectiles[id] = pM.NewProjectile(utils.GenerateId(), start, finish, damage)
}

func (pm *ProjectileManager) NewFireBallProjectile(start, finish *geometry.Point, damage, radius int) {
    pm.projectiles[id] = pM.NewAreaDamageProjectile(utils.GenerateId(), start, finish, damage, radius)
}

func NewProjectileManager(field *gameMap.GameField) *ProjectileManager {
    return &ProjectileManager{field, make(map[int64] pM.Projectiler)}
}
