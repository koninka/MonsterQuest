package engine

import (
    "MonsterQuest/MonsterQuest/connect"
    "MonsterQuest/MonsterQuest/consts"
    "MonsterQuest/MonsterQuest/geometry"
    "time"
)

func getShiftByDirection(dir string) (mx int, my int) {
    switch dir {
    case "north": mx, my = 0, -1
    case "south": mx, my = 0, 1
    case "east":  mx, my = 1, 0
    case "west":  mx, my = -1, 0
    }
    return
}

type player struct {
    login string
    x, y float64
}

func (p *player) move(dir string) {
    pos := p.getShiftedCenter(dir)
    p.x = pos.X
    p.y = pos.Y
}

func (p *player) getShiftedCenter(dir string) geometry.Point {
    x := p.x
    y := p.y
    mx, my := getShiftByDirection(dir)
    x += float64(mx) * consts.PLAYER_SPEED
    y += float64(my) * consts.PLAYER_SPEED
    return geometry.Point{x, y}
}

func (p *player) getCollisionableSide(dir string) geometry.Segment {
    var p1, p2 geometry.Point
    p1 = p.getShiftedCenter(dir)
    p2 = p1
    offset := float64(consts.TILE_SIZE / 2)
    switch dir {
        case "north": 
            p1.Move(-offset, -offset)
            p2.Move(offset, -offset)
        case "south":
            p1.Move(-offset, offset)
            p2.Move(offset, offset)
        case "east":
            p1.Move(offset, -offset)
            p2.Move(offset, offset)
        case "west":
            p1.Move(-offset, -offset)
            p2.Move(-offset, offset)
    }
    return geometry.Segment{p1, p2}
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
