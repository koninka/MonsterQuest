package gameObjects

<<<<<<< HEAD

=======
import "MonsterQuest/MonsterQuest/geometry"

type Mob struct {
	ActiveObject
}

func NewMob(x, y float64) Mov {
	return Mob{ActiveObject{geometry.Point{x, y}}}
}
>>>>>>> collisionDetection
