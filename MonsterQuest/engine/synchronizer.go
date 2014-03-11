package engine

import (
    "MonsterQuest/MonsterQuest/connect"
    "time"
)

type player struct {
    login string
    x, y float64
}

func (p *player) move(dir string) {
    switch dir {
    case "north": p.y += playerSpeed
    case "south": p.y -= playerSpeed
    case "west": p.x -= playerSpeed
    case "east": p.x += playerSpeed
    }
}

type synchronizer struct {
    players map[int64] *player
    sessions map[string] *player
}

func (s *synchronizer) save() {
    db := connect.CreateConnect()
    defer db.Close()
    stmnt, _ := db.Prepare("UPDATE actors SET x = ?, y = ? WHERE id = ?")
    defer stmnt.Close()
    for {
        for id, p := range s.players {
            stmnt.Exec(p.x, p.y, id)
        }
        time.Sleep(databaseTickDuration)
    }
}

func (s *synchronizer) add(sid, login string, x, y float64, id int64) {
	p := player{login, x, y}
	s.players[id] = &p
	s.sessions[sid] = &p
}

func (s *synchronizer) isExists(id int64) bool {
    return s.players[id] != nil
}

func (s *synchronizer) isExistsSession(sid string) bool {
    return s.sessions[sid] != nil
}

func (s *synchronizer) getPlayerInfo(id int64) (string, float64, float64) {
    p := s.players[id]
    return p.login, p.x, p.y
}

func (s *synchronizer) getPlayerById(id int64) *player {
    return s.players[id]
}

func (s *synchronizer) getPlayerBySession(sid string) *player {
    return s.sessions[sid]
}