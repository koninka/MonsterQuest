package projectileManager

import (
    "math"
    "MonsterQuest/gameMap"
    "MonsterQuest/geometry"
    "MonsterQuest/consts"
    "MonsterQuest/utils"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/notifier"
    pM "MonsterQuest/projectileManager/projectiles"
)

type ProjectileManager struct {
    field *gameMap.GameField
    projectiles map[int64] pM.Projectiler
}

func (pm *ProjectileManager) CheckCollision(p pM.Projectiler) (bool, gameObjectsBase.Activer) {
    center := p.GetCenter()
    col, row := int(center.X), int(center.Y)
    if pm.field.IsBlocked(col, row) {
        return true, nil
    } else {
        for _, actor := range pm.field.GetActors(col, row) {
            r := actor.GetRectangle()
            if r.In(&center) {
                return true, actor
            }
        }
    }
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

                notifier.GameNotifier.NotifyAboutFireball(fb.GetCenter().X, fb.GetCenter().Y, fb.Radius)
            } else {
                if actor != nil {
                    // actor.GetHit(???)
                }
            }
            pm.field.UnlinkFromCells(p)
            delete(pm.projectiles, p.GetID())
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
