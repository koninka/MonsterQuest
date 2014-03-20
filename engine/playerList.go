package engine

import (
    "MonsterQuest/connect"
    "MonsterQuest/consts"
    "time"
)

type player struct {
    login string
    x, y float64
}

func (p *player) move(dir string) {
    switch dir {
    case "north": p.y -= consts.PLAYER_SPEED
    case "south": p.y += consts.PLAYER_SPEED
    case "west":  p.x -= consts.PLAYER_SPEED
    case "east":  p.x += consts.PLAYER_SPEED
    }
}

type playerList struct {
    players map[int64] *player
    sessions map[string] *player
}

func (s *playerList) save() {
    db := connect.CreateConnect()
    defer db.Close()
    stmnt, _ := db.Prepare("UPDATE users_position SET x = ?, y = ? WHERE id = ?")
    defer stmnt.Close()
    for {
        for id, p := range s.players {
            stmnt.Exec(p.x, p.y, id)
        }
        time.Sleep(consts.DATABASE_TICK_DURATION)
    }
}

func (s *playerList) add(sid, login string, x, y float64, id int64) {
	p := player{login, x, y}
	s.players[id] = &p
	s.sessions[sid] = &p
}

func (s *playerList) isExists(id int64) bool {
    return s.players[id] != nil
}

func (s *playerList) isExistsSession(sid string) bool {
    return s.sessions[sid] != nil
}

func (s *playerList) getPlayerInfo(id int64) (player, bool) {
    var (
        pl player;
        isExist bool = s.players[id] != nil;
    )
    if isExist {
        p := s.players[id]
        pl = player{p.login, p.x, p.y};
    }
    return pl, isExist
}

func (s *playerList) getPlayerById(id int64) *player {
    return s.players[id]
}

func (s *playerList) getPlayerBySession(sid string) *player {
    return s.sessions[sid]
}
