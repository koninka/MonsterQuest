define(['tester', 'utils/ws', 'jquery'], function(tester, wsock, JQuery) {
    var expect   = chai.expect;
    var data = {
      ssid     : null,
      wsuri    : null,
      login    : null,
      actor_id : null,
      password : null,
      ws       : null
    }

    var ws = null;
    var consts = {};
    var ticksPerSecond = 50;
    var tickDuration = 1000 / ticksPerSecond;
    var slideThreshold = 0.2;
    var playerVelocity = 0.12;
    var default_damage = "3d2";

    function Prepare(done) {
      tester.updateData(data);
      tester.registerAndLogin(data, done);
    }

    function SendViaWS(obj) {
      obj["sid"] = data.ssid;
      ws.sendJSON(obj);
      console.log(obj);
    }

    function StartTesting() {
        SendViaWS({action: "startTesting"});
    }

    function StopTesting() {
        SendViaWS({action: "stopTesting"});
    }

    function SetUpConstants(playerVelocity_, ticksPerSecond_, slideThreshold_) {
        playerVelocity_ = playerVelocity_ || playerVelocity;
        slideThreshold_ = slideThreshold_ || slideThreshold;
        ticksPerSecond_ = ticksPerSecond_ || ticksPerSecond;
        SendViaWS({
            action: "setUpConst",
            playerVelocity: playerVelocity_,
            ticksPerSecond: ticksPerSecond_,
            slideThreshold: slideThreshold_
        });
    }

    function GetConstants() {
      SendViaWS({action: "getConst"});
    }

    function SetUpMap(map) {
      SendViaWS({action: "setUpMap", map: map});
    }

    function PutMob(x, y, race, damage, flags, inventory, stats) {
        flags = flags || [];
        inventory = inventory || [];
        stats = stats || {};
        damage = damage || default_damage;
        SendViaWS({
            action: "putMob",
            x: x,
            y: y,
            flags: flags,
            race: race,
            inventory: inventory,
            stats: stats,
            dealtDamage: damage
        });
    }

    function PutPlayer(x, y, inventory, stats, slots) {
        inventory = inventory || [];
        stats = stats || {};
        slots = slots || {};
        SendViaWS({
            action: "putPlayer",
            x: x,
            y: y,
            inventory: inventory,
            stats: stats,
            slots: slots
        });
    }

    function MovePlayer(sid, direction) {
      SendViaWS({
         action: "enforce",
         enforcedAction: {
            sid: sid,
            action: "move",
            direction: direction
         }
      });
    }

    function Examine(id) {
      SendViaWS({action: "examine", id: id});
    }

    function Sleep(time, callback, param) {
      setTimeout(function() { callback(param); }, time)
    }

    function GetShiftByDir(dir) {
      switch (dir) {
         case "north":
            return [0, - playerVelocity];
         case "south":
            return [0, playerVelocity];
         case "west":
            return [-playerVelocity, 0];
         case "east":
            return [playerVelocity, 0];
      }
    }

    function Test(){

        before(function(done){
            Prepare(done);
        });

        after(function(done) {
            tester.send({action: 'logout', sid: data.ssid}, function() { done(); });
        });

        describe("Mob flags", function() {

            afterEach(function(done) {
                ws.onmessage = function(e){
                    var resp = JSON.parse(e.data);
                    if(resp['action'] == 'stopTesting') {
                        done();
                    }
                };
                ws.sendJSON({action: "stopTesting", sid: data.ssid});
            });

            describe('Move flag', function() {

                it('should successfully stay in place', function(done){
                    ws = data.ws;
                    var mob_pt = { x: 1.5, y: 1.2 };
                    var mob = mob_pt;
                    var isSetMap = false;
                    var isSetConst = false;

                    ws.onmessage = function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", ".", ".", "#"],
                                [".", ".", ".", "."],
                                [".", ".", ".", "."],
                                ["#", ".", ".", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob['id'] = response['id'];
                            Sleep(tickDuration * 25, Examine, mob['id']);
                        } else if (response['action'] == 'examine') {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.be.ok;
                            // assert(mob['x'] !=  response['x'] || mob['y'] != response['y'], "coordiantes of the mob had to change");
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob['x'], mob['y'], "ORC");
                            isSetMap = isSetConst = false;
                        }
                    };

                    StartTesting();
                 });

                it('should successfully walk around', function(done){
                    ws = data.ws;
                    var mob = { x: 1.5, y: 1.2 };
                    var isSetMap = false;
                    var isSetConst = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#"], //сделать проверку на границу карты
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob['id'] = response['id'];
                            Sleep(3000, Examine, mob['id']);
                        } else if (response['action'] == 'examine') {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.not.be.ok;
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob['x'], mob['y'], "ORC", default_damage, ["CAN_MOVE"]);
                            isSetMap = isSetConst = false;
                        }
                    };

                    StartTesting();
                 });

                it('should successfully walk around in narrow tunnel', function(done){
                    ws = data.ws;
                    var mob = { x: 2.5, y: 1.5 };
                    var isSetMap = false;
                    var isSetConst = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob['id'] = response['id'];
                            Sleep(3000, Examine, mob['id']);
                        } else if (response['action'] == 'examine') {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.not.be.ok;
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob['x'], mob['y'], "ORC", undefined, ["CAN_MOVE"]);
                            isSetMap = isSetConst = false;
                        }
                    };

                    StartTesting();
                 });

                it('should stay in place[cramped and dark][not empty place]', function(done){
                    ws = data.ws;
                    var mob1 = { x: 1.5, y: 1.5 };
                    var mob2 = { x: 2.5, y: 1.5 };
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#"],
                                ["#", ".", ".", "#"],
                                ["#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == 'examine') {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_x"] = response['x'];
                            m["ex_y"] = response['y'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            Sleep(3000, Examine, mob1['id']);
                            Sleep(3000, Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob1.x, mob1.y, "ORC", default_damage, ["CAN_MOVE"]);
                            PutMob(mob2.x, mob2.y, "ORC", default_damage, ["CAN_MOVE"]);
                            isSetMap = isSetConst = false;
                        }
                        if (mob1.hasOwnProperty('ex_x') && mob1.hasOwnProperty('ex_y') &&
                                mob2.hasOwnProperty('ex_x') && mob2.hasOwnProperty('ex_y')) {
                            expect(mob1.x).to.equal(mob1.ex_x);
                            expect(mob1.y).to.equal(mob1.ex_y);
                            expect(mob2.x).to.equal(mob2.ex_x);
                            expect(mob2.y).to.equal(mob2.ex_y);
                            done();
                        }
                    };

                    StartTesting();
                 });
            });

            describe('Hate and Blow flag', function() {

                it('mob(orc) shouldn\'t attack themselves[orc hate orc]', function(done){
                    ws = data.ws;
                    var mob = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ORCS", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob['id'] = response['id'];
                            Sleep(3200, Examine, mob['id']);
                        } else if (response['action'] == 'examine') {
                            expect(response['health']).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob.x, mob.y, mob.race, "7d9", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            isSetMap = isSetConst = false;
                        }
                    };

                    StartTesting();
                 });

                it('mob(orc) should attack another mob(animal) and after then the animal mustn\'t attack the orc(animal don\'t have blow flag)[orc hate animal, orc and animal are close]', function(done){
                    ws = data.ws;
                    var mob1 = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMALS", "CAN_BLOW"]};
                    var mob2 = { x: 2.5, y: 4.2, hp: 450, max_hp: 450, race: "ANIMAL", flags: []};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == 'examine') {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            Sleep(3000, Examine, mob1['id']);
                            Sleep(3000, Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob1.x, mob1.y, mob1.race, "5d4", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.equal(mob1.hp);
                            expect(mob2.ex_hp).to.not.equal(mob2.hp);
                            expect(mob1.ex_hp).to.be.at.least(mob2.ex_hp);
                            done();
                        }
                    };

                    StartTesting();
                 });

                it('mob(orc) should attack another mob(animal) and after then the animal must attack the orc[orc hate animal, orc and animal are close]', function(done){
                    ws = data.ws;
                    var mob1 = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMALS", "CAN_BLOW"]};
                    var mob2 = { x: 2.5, y: 4.2, hp: 450, max_hp: 450, race: "ANIMAL", flags: ["CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == 'examine') {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            Sleep(3000, Examine, mob1['id']);
                            Sleep(3000, Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob1.x, mob1.y, mob1.race, "7d9", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.not.equal(mob1.hp);
                            expect(mob2.ex_hp).to.not.equal(mob2.hp);
                            expect(mob1.ex_hp).to.be.at.least(mob2.ex_hp);
                            done();
                        }
                    };

                    StartTesting();
                 });

                it('mob(orc) and mob(animal) should stay in place[orc hate animal, orc and animal located far]', function(done){
                    ws = data.ws;
                    var mob1 = { x: 1.5, y: 1.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMALS", "CAN_BLOW"]};
                    var mob2 = { x: 3.8, y: 5, hp: 450, max_hp: 450, race: "ANIMAL", flags: []};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    ws.onmessage = function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == 'examine') {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob1.x, mob1.y, mob1.race, "5d4", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (isPutMob1 && isPutMob2) {
                            Sleep(3000, Examine, mob1['id']);
                            Sleep(3000, Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.equal(mob1.hp);
                            expect(mob1.hp).to.equal(mob1.max_hp);
                            expect(mob2.ex_hp).to.equal(mob2.hp);
                            expect(mob2.hp).to.equal(mob2.max_hp);
                            done();
                        }
                    };

                    StartTesting();
                 });

                it('mob(orc) shouldn\'t attack player, player shouldn\'t attack mob[orc don\'t hate player]', function(done){
                    ws = data.ws;
                    var player = { x: 3.5, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMALS", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    ws.onmessage = function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal('ok');
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == 'examine') {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            Sleep(3000, Examine, mob.id);
                            Sleep(3000, Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.equal(player.hp);
                            expect(player.hp).to.equal(player.max_hp);
                            done();
                        }
                    };

                    StartTesting();
                });

                it('mob(orc) should attack player[orc hate player]', function(done){
                    ws = data.ws;
                    var player = { x: 3.3, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_PLAYERS", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    ws.onmessage = function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal('ok');
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == 'examine') {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            Sleep(3000, Examine, mob.id);
                            Sleep(3000, Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.be.below(player.hp);
                            done();
                        }
                    };

                    StartTesting();
                });

                it('mob should walk around in narrow tunnel and attack player at least once[orc hate player]', function(done){
                    ws = data.ws;
                    var player = { x: 1.5, y: 1.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 3.1, y: 1.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_PLAYERS", "CAN_BLOW", "CAN_MOVE"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(11000);
                    ws.onmessage = function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == 'startTesting') {
                            expect(response['result']).to.equal('ok');
                            SetUpConstants();
                            SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == 'setUpConst') {
                            expect(response['result']).to.equal('ok');
                            isSetConst = true;
                        } else if (response['action'] == 'setUpMap') {
                            expect(response['result']).to.equal('ok');
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal('ok');
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == 'putMob') {
                            expect(response['result']).to.equal('ok');
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == 'examine') {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            Sleep(8000, Examine, mob.id);
                            Sleep(8000, Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.be.below(player.hp);
                            done();
                        }
                    };

                    StartTesting();
                });
            });
        });
    }


    return {
      Test: Test
    }
});