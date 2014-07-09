define(['utils/testsAPI'], function(testsAPI) {

    var expect   = chai.expect;

    function Test(){

        describe("Mob flags", function() {

            before(testsAPI.Prepare);

            after(testsAPI.Logout);

            afterEach(testsAPI.AfterEach);

            describe('Move flag', function() {

                it('should successfully stay in place', function(done){
                    var mob_pt = { x: 1.5, y: 1.2 };
                    var mob = mob_pt;
                    var isSetMap = false;
                    var isSetConst = false;

                    testsAPI.SetWSHandler(function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", ".", ".", "#"],
                                [".", ".", ".", "."],
                                [".", ".", ".", "."],
                                ["#", ".", ".", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob['id'] = response['id'];
                            testsAPI.Sleep(testsAPI.tickDuration * 25, testsAPI.Examine, mob['id']);
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.be.ok;
                            // assert(mob['x'] !=  response['x'] || mob['y'] != response['y'], "coordiantes of the mob had to change");
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob['x'], mob['y'], "ORC");
                            isSetMap = isSetConst = false;
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('should successfully walk around', function(done){
                    var mob = { x: 1.5, y: 1.2 };
                    var isSetMap = false;
                    var isSetConst = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#"], //сделать проверку на границу карты
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob['id'] = response['id'];
                            testsAPI.Sleep(3000, testsAPI.Examine, mob['id']);
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.not.be.ok;
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob['x'], mob['y'], "ORC", testsAPI.default_damage, ["CAN_MOVE"]);
                            isSetMap = isSetConst = false;
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('should successfully walk around in narrow tunnel', function(done){
                    var mob = { x: 2.5, y: 1.5 };
                    var isSetMap = false;
                    var isSetConst = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
                                ["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob['id'] = response['id'];
                            testsAPI.Sleep(3000, testsAPI.Examine, mob['id']);
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(mob['x'] ==  response['x'] && mob['y'] == response['y']).to.not.be.ok;
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob['x'], mob['y'], "ORC", undefined, ["CAN_MOVE"]);
                            isSetMap = isSetConst = false;
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('should stay in place[cramped and dark][not empty place]', function(done){
                    var mob1 = { x: 1.5, y: 1.5 };
                    var mob2 = { x: 2.5, y: 1.5 };
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {

                        var response = JSON.parse(e.data);

                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#"],
                                ["#", ".", ".", "#"],
                                ["#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == testsAPI.examineAction) {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_x"] = response['x'];
                            m["ex_y"] = response['y'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            testsAPI.Sleep(3000, testsAPI.Examine, mob1['id']);
                            testsAPI.Sleep(3000, testsAPI.Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob1.x, mob1.y, "ORC", testsAPI.default_damage, ["CAN_MOVE"]);
                            testsAPI.PutMob(mob2.x, mob2.y, "ORC", testsAPI.default_damage, ["CAN_MOVE"]);
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
                    });

                    testsAPI.StartTesting();
                 });
            });

            describe('Hate and Blow flag', function() {

                it('mob(orc) shouldn\'t attack themselves[orc hate orc]', function(done){
                    var mob = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ORC", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob['id'] = response['id'];
                            testsAPI.Sleep(3200, testsAPI.Examine, mob['id']);
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(response['health']).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            done();
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, mob.race, "7d9", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            isSetMap = isSetConst = false;
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('mob(orc) should attack another mob(animal) and after then the animal mustn\'t attack the orc(animal don\'t have blow flag)[orc hate animal, orc and animal are close]', function(done){
                    var mob1 = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMAL", "CAN_BLOW"]};
                    var mob2 = { x: 2.5, y: 4.2, hp: 450, max_hp: 450, race: "ANIMAL", flags: []};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == testsAPI.examineAction) {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            testsAPI.Sleep(3000, testsAPI.Examine, mob1['id']);
                            testsAPI.Sleep(3000, testsAPI.Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob1.x, mob1.y, mob1.race, "5d4", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            testsAPI.PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.equal(mob1.hp);
                            expect(mob2.ex_hp).to.not.equal(mob2.hp);
                            expect(mob1.ex_hp).to.be.at.least(mob2.ex_hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('mob(orc) should attack another mob(animal) and after then the animal must attack the orc[orc hate animal, orc and animal are close]', function(done){
                    var mob1 = { x: 2.5, y: 3.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMAL", "CAN_BLOW"]};
                    var mob2 = { x: 2.5, y: 4.2, hp: 450, max_hp: 450, race: "ANIMAL", flags: ["CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == testsAPI.examineAction) {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isPutMob1 && isPutMob2) {
                            testsAPI.Sleep(3000, testsAPI.Examine, mob1['id']);
                            testsAPI.Sleep(3000, testsAPI.Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob1.x, mob1.y, mob1.race, "7d9", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            testsAPI.PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.not.equal(mob1.hp);
                            expect(mob2.ex_hp).to.not.equal(mob2.hp);
                            expect(mob1.ex_hp).to.be.at.least(mob2.ex_hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('mob(orc) and mob(animal) should stay in place[orc hate animal, orc and animal located far]', function(done){
                    var mob1 = { x: 1.5, y: 1.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMAL", "CAN_BLOW"]};
                    var mob2 = { x: 3.8, y: 5, hp: 450, max_hp: 450, race: "ANIMAL", flags: []};
                    var isSetMap = false;
                    var isSetConst = false;
                    var isPutMob1 = false;
                    var isPutMob2 = false;
                    this.timeout(4500);

                    testsAPI.SetWSHandler(function(e) {
                        var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                ["#", "#", "#", "#", "#", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", ".", ".", ".", ".", "#"],
                                ["#", "#", "#", "#", "#", "#"]
                            ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var id = response['id'];
                            var m = isPutMob1 ? mob2 : mob1;
                            m['id'] = response['id'];
                            if (isPutMob1) {
                                isPutMob2 = true;
                            } else {
                                isPutMob1 = true;
                            }
                        } else if (response['action'] == testsAPI.examineAction) {
                            var m = response['id'] == mob1['id'] ? mob1 : mob2;
                            m["ex_hp"] = response['health'];
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob1.x, mob1.y, mob1.race, "5d4", mob1.flags, [], {HP: mob1.hp, MAX_HP: mob1.max_hp});
                            testsAPI.PutMob(mob2.x, mob2.y, mob2.race, "3d4", mob2.flags, [], {HP: mob2.hp, MAX_HP: mob2.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (isPutMob1 && isPutMob2) {
                            testsAPI.Sleep(3000, testsAPI.Examine, mob1['id']);
                            testsAPI.Sleep(3000, testsAPI.Examine, mob2['id']);
                            isPutMob1 = isPutMob2 = false;
                        }
                        if (mob1.hasOwnProperty('ex_hp') && mob2.hasOwnProperty('ex_hp')) {
                            expect(mob1.ex_hp).to.equal(mob1.hp);
                            expect(mob1.hp).to.equal(mob1.max_hp);
                            expect(mob2.ex_hp).to.equal(mob2.hp);
                            expect(mob2.hp).to.equal(mob2.max_hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                 });

                it('mob(orc) shouldn\'t attack player, player shouldn\'t attack mob[orc don\'t hate player]', function(done){
                    var player = { x: 3.5, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_ANIMAL", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == testsAPI.examineAction) {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            testsAPI.Sleep(3000, testsAPI.Examine, mob.id);
                            testsAPI.Sleep(3000, testsAPI.Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.equal(player.hp);
                            expect(player.hp).to.equal(player.max_hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                });

                it('mob(orc) should attack player[orc hate player]', function(done){
                    var player = { x: 3.3, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_PLAYER", "CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == testsAPI.examineAction) {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            testsAPI.Sleep(3000, testsAPI.Examine, mob.id);
                            testsAPI.Sleep(3000, testsAPI.Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.be.below(player.hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                });

                it('mob should walk around in narrow tunnel and attack player at least once[orc hate player]', function(done){
                    var player = { x: 1.5, y: 1.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 3.1, y: 1.5, hp: 500, max_hp: 500, race: "ORC", flags: ["HATE_PLAYER", "CAN_BLOW", "CAN_MOVE"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(11000);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == 'putPlayer') {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            player.id = response['id'];
                            player.sid = response['sid'];
                            counter++;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == testsAPI.examineAction) {
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            testsAPI.Sleep(8000, testsAPI.Examine, mob.id);
                            testsAPI.Sleep(8000, testsAPI.Examine, player.id);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(mob.ex_hp).to.equal(mob.hp);
                            expect(mob.hp).to.equal(mob.max_hp);
                            expect(player.ex_hp).to.be.below(player.hp);
                            done();
                        }
                    });

                    testsAPI.StartTesting();
                });
            });
        });
    }


    return {
      Test: Test
    }
});