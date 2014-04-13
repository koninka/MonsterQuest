package gameObjectsFlags

import (
    "math"
    "MonsterQuest/gameMap"
    "MonsterQuest/geometry"
    "MonsterQuest/gameObjectsBase"
    "MonsterQuest/consts"
)

type Flag struct {
    field *gameMap.GameField
    MsgsChannel chan consts.JsonType
}

type MoveFlag struct {
    Flag
}

func (m *MoveFlag) checkCollisionWithWalls(obj gameObjectsBase.Activer, dir int) (bool, geometry.Point) {
    pos := obj.GetShiftedFrontSide(dir)
    if m.field.IsBlocked(int(pos.X), int(pos.Y)) {
        switch dir {
        case consts.NORTH_DIR:
            pos.Y = math.Ceil(pos.Y) + consts.OBJECT_HALF
        case consts.SOUTH_DIR:
            pos.Y = math.Floor(pos.Y) - consts.OBJECT_HALF
        case consts.EAST_DIR:
            pos.X = math.Floor(pos.X) - consts.OBJECT_HALF
        case consts.WEST_DIR:
            pos.X = math.Ceil(pos.X) + consts.OBJECT_HALF
        }
        return false, pos
    }
    eps := 2.0
    side, pos := obj.GetCollisionableSide(dir)
    res1 := m.field.IsBlocked(int(side.Point1.X), int(side.Point1.Y))
    res2 := m.field.IsBlocked(int(side.Point2.X), int(side.Point2.Y))
    var near float64
    if res1 || res2 {
        switch dir {
        case consts.NORTH_DIR, consts.SOUTH_DIR:
            if res1 {
                near = math.Ceil(side.Point1.X) - side.Point1.X
            } else {
                near = math.Floor(side.Point1.X) - side.Point1.X
            }
            if math.Abs(near) < eps {
                side.Point1.X = side.Point1.X + near
                side.Point2.X = side.Point2.X + near
            } else {
                return false, obj.GetCenter()
            }
            pos.X = (side.Point1.X + side.Point2.X) / 2
        case consts.EAST_DIR, consts.WEST_DIR:
            if res1 {
                near = math.Ceil(side.Point1.Y) - side.Point1.Y
            } else {
                near = math.Floor(side.Point1.Y) - side.Point1.Y
            }
            if math.Abs(near) < eps {
                side.Point1.Y = side.Point1.Y + near
                side.Point2.Y = side.Point2.Y + near
            } else {
                return false, obj.GetCenter()
            }
            pos.Y = (side.Point1.Y + side.Point2.Y) / 2
        }
    }
    return true, pos
}

func (m *MoveFlag) checkCollisionWithActorsInCell(col, row int, segment *geometry.Segment) bool {
    res := false
    for _, actor := range m.field.Actors[row][col] {
        r := actor.GetRectangle()
        res = res || r.CrossedBySegment(segment)
    }
    return res
}

func (m *MoveFlag) checkCollisionWithActors(obj gameObjectsBase.Activer, dir int) (bool, geometry.Point) {
    segment, pos := obj.GetCollisionableSide(dir)
    col1, row1 := int(segment.Point1.X), int(segment.Point1.Y)
    col2, row2 := int(segment.Point2.X), int(segment.Point2.Y)
    res := m.checkCollisionWithActorsInCell(col1, row1, &segment) || m.checkCollisionWithActorsInCell(col2, row2, &segment)
    if res {
        pos = obj.GetCenter()
    }
    return res, pos
}

func (m *MoveFlag) calcNewCenterForActor(obj gameObjectsBase.Activer, dir int) (bool, geometry.Point) {
    collisionOccured := false
    noCollisionWithWall, res := m.checkCollisionWithWalls(obj, dir)
    if noCollisionWithWall {
        collisionWithActorOccured, alternativeRes := m.checkCollisionWithActors(obj, dir)
        if collisionWithActorOccured {
            res = alternativeRes
            collisionOccured = true
        }
    } else {
        collisionOccured = true
    }
    return collisionOccured, res
}

func (m *MoveFlag) Do(obj gameObjectsBase.Activer) {
    dir := obj.GetDir()
    if dir == -1 {
        return
    }
    collisionOccured, newCenter := m.calcNewCenterForActor(obj, dir)
    m.field.UnlinkActorFromCells(obj)
    obj.ForcePlace(newCenter)
    m.field.LinkActorToCells(obj)
    if collisionOccured {
        obj.NotifyAboutCollision()
    }
}

type AttackFlag struct {
    Flag
}

func (a *AttackFlag) Do(obj gameObjectsBase.Activer) {
    target := obj.GetTarget()
    if target != nil && geometry.Distance(obj.GetCenter(), target.GetCenter()) <= float64(obj.GetAttackRadius()) {
        // attack target. may be, attack every tick is very "cool", so it's need to be discussed

        a.MsgsChannel <- map[string] interface{} {
            "action"      : "attack",
            "object"      : obj,
            "affectedObj" : target,
        }
    }
}

type HateFlag struct {
    Flag
    hated int
}

func (h *HateFlag) Do(obj gameObjectsBase.Activer) {
    center := obj.GetCenter()
    lt, rb := h.field.GetVisibleArea(center.X, center.Y, obj.GetRadiusVision())
    for i := int(lt.Y); i < int(rb.Y); i++ {
        for j := int(lt.X); j < int(rb.X); j++ {
            for _, m := range h.field.Actors[i][j] {
                if m.GetKind().GetRace() == h.hated {
                    obj.SetTarget(m)
                    return
                }
            }
        }
    }
}
