package engine

import (
    "MonsterQuest/MonsterQuest/connect"
    "MonsterQuest/MonsterQuest/consts"
    "MonsterQuest/MonsterQuest/gameObjects"
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
        for id, p := range s.players {
            stmnt.Exec(p.Center.X, p.Center.Y, id)
        }
        time.Sleep(consts.DATABASE_TICK_DURATION)
    }
}

func (s *playerList) add(sid, login string, x, y float64, id int64) *gameObjects.Player {
	p := gameObjects.NewPlayer(login, x, y)
	s.players[id] = &p
	s.sessions[sid] = &p
    return &p
}

func (s *playerList) isExists(id int64) bool {
    return s.players[id] != nil
}

func (s *playerList) isExistsSession(sid string) bool {
    return s.sessions[sid] != nil
}

func (s *playerList) getPlayerInfo(id int64) (gameObjects.Player, bool) {
    var (
        pl gameObjects.Player;
        isExist bool = s.players[id] != nil;
    )
    if isExist {
        p := s.players[id]
        pl = gameObjects.NewPlayer(p.Login, p.Center.X, p.Center.Y);
    }
    return pl, isExist
}

func (s *playerList) getPlayerById(id int64) *gameObjects.Player {
    return s.players[id]
}

func (s *playerList) getPlayerBySession(sid string) *gameObjects.Player {
    return s.sessions[sid]
}
