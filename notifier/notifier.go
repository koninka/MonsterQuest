package notifier

import (
	"MonsterQuest/consts"
	"MonsterQuest/gameObjectsBase"
)

type Notifier interface {
	NotifyAboutAttack(attacker, target gameObjectsBase.Activer, msg consts.JsonType)
	NotifyAboutFireball(x, y float64, radius int)
}

var GameNotifier Notifier
