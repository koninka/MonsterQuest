package engine

import (
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "MonsterQuest/gameObjects"
    "time"
)

type playerList struct {
    players map[int64] *gameObjects.Player
    sessions map[string] *gameObjects.Player
}

func (s *playerList) save() {
    db := connect.CreateConnect()
    defer db.Close()
    stmnt, _ := db.Prepare("UPDATE users_position SET x = ?, y = ? WHERE id = ?")
    defer stmnt.Close()
    for {
        for _, p := range s.players {
            stmnt.Exec(p.Center.X, p.Center.Y, p.DBId)
        }
        time.Sleep(consts.DATABASE_TICK_DURATION)
    }
}

func (s *playerList) add(p *gameObjects.Player) {
	s.players[p.GetID()] = p
	s.sessions[p.SID] = p
}

func (s *playerList) isExists(id int64) bool {
    return s.players[id] != nil
}

func (s *playerList) isExistsSession(sid string) bool {
    return s.sessions[sid] != nil
}

func (s *playerList) getPlayerInfo(id int64) (*gameObjects.Player, bool) {
    if s.players[id] != nil {
        return s.players[id], true
    } else {
        return nil, false
    }
}

func (s *playerList) getPlayerById(id int64) *gameObjects.Player {
    return s.players[id]
}

func (s *playerList) deletePlayerById(id int64) {
    delete(s.sessions, s.players[id].SID)
    delete(s.players, id)
}

func (s *playerList) getPlayerBySession(sid string) *gameObjects.Player {
    return s.sessions[sid]
}

func (s *playerList) deletePlayerBySession(sid string) {
    delete(s.players, s.sessions[sid].GetID())
    delete(s.sessions, sid)
}
