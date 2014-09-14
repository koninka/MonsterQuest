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

func (pm *ProjectileManager) CheckCollision(p pM.Projectiler, dx, dy float64) (bool, gameObjectsBase.Activer) {
    center := p.GetCenter()
    newCenter := geometry.MakePoint(center.X + dx, center.Y + dy)
    rects := make([]*geometry.Rectangle, 0, 100)
    rect2obj := make(map[*geometry.Rectangle] gameObjectsBase.Activer)
    for i := int(math.Min(center.Y, newCenter.Y)); i <= int(math.Max(center.Y, newCenter.Y)); i++ {
        for j := int(math.Min(center.X, newCenter.X)); j <= int(math.Max(center.X, newCenter.X)); j++ {
            if pm.field.IsBlocked(j, i) {
                rects = append(rects, pm.field.GetCellRectangle(j, i))
            } else {
                for _, actor := range pm.field.GetActors(j, i) {
                    if actor.GetID() != p.GetOwner().GetID(){
                        r := actor.GetRectangle()
                        rects = append(rects, &r)
                        rect2obj[&r] = actor
                    }
                }
            }
        }
    }
    s := geometry.MakeSegment(center.X, center.Y, center.X + dx, center.Y + dy)
    for _, rect := range rects {
        if rect.CrossedBySegment(s) {
            return true, rect2obj[rect]
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
        dx, dy := x * shift / norm, y * shift / norm
        if collisionOccured, actor := pm.CheckCollision(p, dx, dy); collisionOccured {
            if fb, ok := p.(*pM.AreaDamageProjectile); ok {
                x, y := fb.GetCenter().X, fb.GetCenter().Y
                notifier.GameNotifier.NotifyAboutFireball(x, y, fb.Radius)
                lt, rb := pm.field.GetSquareArea(x, y, fb.Radius)
                l, r := int(lt.X), int(rb.X)
                t, b := int(lt.Y), int(rb.Y)
                for i := t; i < b; i++ {
                    for j := l; j < r; j++ {
                        for _, actor := range pm.field.GetActors(j, i) {
                            go notifier.GameNotifier.NotifyAboutAttack(p.GetOwner(), actor, actor.GetHit(p, p.GetOwner()))
                        }
                    }
                }
            } else {
                if actor != nil {
                    go notifier.GameNotifier.NotifyAboutAttack(p.GetOwner(), actor, actor.GetHit(p, p.GetOwner()))
                }
            }
            delete(pm.projectiles, p.GetID())
        } else {
            p.Shift(dx, dy)
            pm.field.LinkToCells(p)
        }
    }
}

func (pm *ProjectileManager) NewArrowProjectile(start, finish *geometry.Point, damage int, owner gameObjectsBase.Activer) {
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewArrowProjectile(id, start, finish, damage, owner)
}

func (pm *ProjectileManager) NewFireBallProjectile(start, finish *geometry.Point, damage, radius int, owner gameObjectsBase.Activer) {
    id := utils.GenerateId()
    pm.projectiles[id] = pM.NewAreaDamageProjectile(id, start, finish, damage, radius, owner)
}

func InitProjectileManager(field *gameMap.GameField) {
    PManager = &ProjectileManager{field, make(map[int64] pM.Projectiler)}
}

