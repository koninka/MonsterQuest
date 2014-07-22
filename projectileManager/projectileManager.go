package projectileManager

import (
    "math"
    "MonsterQuest/gameMap"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
    "MonsterQuest/utils"
    "MonsterQuest/gameObjectsBase"
    pM "MonsterQuest/projectileManager/projectiles"
)

type ProjectileManager struct {
    field *gameMap.GameField
    projectiles map[int64] pM.Projectiler
}

func (pm *ProjectileManager) CheckCollision(p pM.Projectiler) (bool, gameObjectsBase.Activer) {
    return false, nil
}

func (pm *ProjectileManager) Do() {
    for _, p := range pm.projectiles {
        var shift float64
        d := geometry.Distance(p.GetCenter(), p.GetDestination())
        if d > consts.PROJECTILE_VELOCITY {
            shift = consts.PROJECTILE_VELOCITY
        } else {
            shift = d
        }
        x := p.GetDestination().X - p.GetCenter().X
        y := p.GetDestination().Y - p.GetCenter().Y
        norm := math.Sqrt(x * x + y * y)
        dx := x * shift / norm
        dy := y * shift / norm
        p.Shift(dx, dy)
        if collisionOccured, actor := pm.CheckCollision(p); collisionOccured {
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
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewProjectile(id, start, finish, damage)
}

func (pm *ProjectileManager) NewFireBallProjectile(start, finish *geometry.Point, damage, radius int) {
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewAreaDamageProjectile(id, start, finish, damage, radius)
}

func NewProjectileManager(field *gameMap.GameField) *ProjectileManager {
    return &ProjectileManager{field, make(map[int64] pM.Projectiler)}
}
