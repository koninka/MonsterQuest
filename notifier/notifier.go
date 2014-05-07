package notifier

import (
	"MonsterQuest/consts"
	"MonsterQuest/gameObjectsBase"
)

type Notifier interface {
	NotifyAboutAttack(attacker, target gameObjectsBase.Activer, msg consts.JsonType)
}

var GameNotifier Notifier
