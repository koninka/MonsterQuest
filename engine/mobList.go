package engine

import (
	"MonsterQuest/gameObjects"
	"MonsterQuest/connect"
)

type mobList struct {
	mobs map[int64]*gameObjects.Mob
}

func (ml *mobList) addMob(x, y float64) {
	db := connect.CreateConnect()
	stmt, _ := db.Prepare("INSERT INTO mobs_position(x, y) VALUES(?, ?)")
	res, _ := stmt.Exec(x, y)
	id, _ := res.LastInsertId()
	mob := gameObjects.NewMob(id, x, y)
	ml.mobs[id] = &mob
}
