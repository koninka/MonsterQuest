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

var PManager *ProjectileManager = nil

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
        if geometry.Distance(center, p.GetDestination()) < 1e-2 {
            return true, nil
        }
    }
    return false, nil
}

func (pm *ProjectileManager) Do() {
    for _, p := range pm.projectiles {
        pm.field.UnlinkFromCells(p)
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
        p.Shift(x * shift / norm, y * shift / norm)
        if collisionOccured, actor := pm.CheckCollision(p); collisionOccured {
            if fb, ok := p.(*pM.AreaDamageProjectile); ok {
                notifier.GameNotifier.NotifyAboutFireball(fb.GetCenter().X, fb.GetCenter().Y, fb.Radius)
            } else {
                if actor != nil {
                    actor.GetHit(p, p.GetOwner())
                }
            }
            delete(pm.projectiles, p.GetID())
        } else {
            pm.field.LinkToCells(p)
        }
    }
}

func (pm *ProjectileManager) NewArrowProjectile(start, finish *geometry.Point, damage int, owner gameObjectsBase.Activer) {
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewProjectile(id, start, finish, damage, owner)
}

func (pm *ProjectileManager) NewFireBallProjectile(start, finish *geometry.Point, damage, radius int, owner gameObjectsBase.Activer) {
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewAreaDamageProjectile(id, start, finish, damage, radius, owner)
}

func InitProjectileManager(field *gameMap.GameField) {
    PManager = &ProjectileManager{field, make(map[int64] pM.Projectiler)}
}

