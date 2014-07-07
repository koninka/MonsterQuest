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

    function PutPlayer(x, y, inventory, characteristics) {
      inventory = inventory || [];
      characteristics = characteristics || {};
      SendViaWS({
         action: "putPlayer",
         x: x,
         y: y,
         inventory: inventory,
         characteristics: characteristics
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
            return [- playerVelocity, 0];
         case "east":
            return [playerVelocity, 0];
      }
    }

    function Test(){

        before(function(done){
                Prepare(done);
        });

        describe('Players\' motion', function() {

            afterEach( function(done) {
                ws.onmessage = function(e){
                    var resp = JSON.parse(e.data);
                    if(resp['action'] == 'stopTesting')
                        done();
                };
                ws.sendJSON({action: "stopTesting", sid: data.ssid});
            });

            it('should successfully move player in all directions', function(done){
                ws = data.ws;
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east"];
                this.timeout(8000);

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], dirs[moveCounter++]);
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        var shift = GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else
                            done();
                    }
                };

                StartTesting();
             });

            it('should not move player in all directions[walls around]', function(done){
                ws = data.ws;
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east"];

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            ["#", "#", "#"],
                            ["#", ".", "#"],
                            ["#", "#", "#"]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], dirs[moveCounter++]);
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else
                            done();
                    }
                };

                StartTesting();
             });

            it('should not move player[another players on way]', function(done){
                ws = data.ws;
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0, putPlayerCounter = 0;
                var dirs = ["north", "south", "west", "east"];
                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        var x = player['x'], y = player['y'];
                        PutPlayer(x, y);
                        PutPlayer(x - 1, y - 1);
                        PutPlayer(x - 1, y);
                        PutPlayer(x - 1, y + 1);
                        PutPlayer(x, y - 1);
                        PutPlayer(x, y + 1);
                        PutPlayer(x + 1, y - 1);
                        PutPlayer(x + 1, y);
                        PutPlayer(x + 1, y + 1);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (putPlayerCounter == 0) {
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        }
                        putPlayerCounter++;
                        if (putPlayerCounter == 9) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        }
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else
                            done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player in all directions[bound collision with walls]', function(done){
                ws = data.ws;
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east", "south", "north", "east", "west"];

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            ["#", ".", "#"],
                            [".", ".", "."],
                            ["#", ".", "#"],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], dirs[moveCounter++]);
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        var shift = GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                };

                StartTesting();
             });

            it('should successfully move player in all directions[bound collision with players]', function(done){
                ws = data.ws;
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0, putPlayerCounter = 0;
                var dirs = ["north", "south", "west", "east", "south", "north", "east", "west"];

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        var x = player['x'], y = player['y'];
                        PutPlayer(x, y);
                        PutPlayer(x - 1, y - 1);
                        PutPlayer(x - 1, y + 1);
                        PutPlayer(x + 1, y - 1);
                        PutPlayer(x + 1, y + 1);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (putPlayerCounter == 0) {
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        }
                        putPlayerCounter++;
                        if (putPlayerCounter == 5) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        }
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], dirs[moveCounter++]);
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        var shift = GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                };

                StartTesting();
             });

            it('should successfully move player in east and west[bound collision with wall(north) and player(south)]', function(done){
                ws = data.ws;
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0;
                var putFirstPlayer = false;
                var dirs = ["east", "west", "west", "east"];

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", "#", "."],
                            [".", ".", "."],
                            [".", ".", "."],
                            [".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                        PutPlayer(player['x'], player['y'] + 1);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (!putFirstPlayer) {
                            putFirstPlayer = true;
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        } else {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        }
                    } else if (response['action'] == 'examine') {
                        var shift = GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            MovePlayer(player['sid'], dirs[moveCounter++]);
                            Sleep(tickDuration * 2.5, Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                };

                StartTesting();
             });

             it('should successfully move player[wall sliding(left, north)]', function(done){
                ws = data.ws;
                var player = { x: 1.5 - 1 + slideThreshold, y: 2.5 };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "north");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(0.5);
                        expect(response['y']).to.equal(player['y'] - playerVelocity);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(right, north)]', function(done){
                ws = data.ws;
                var player = { x: 1.5 + 1 - slideThreshold, y: 2.5 };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "north");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(2.5);
                        expect(response['y']).to.equal(player['y'] - playerVelocity);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(left, south)]', function(done){
                ws = data.ws;
                var player = { x: 1.5 - 1 + slideThreshold, y: 0.5 };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "south");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(0.5);
                        expect(response['y']).to.equal(player['y'] + playerVelocity);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(right, south)]', function(done){
                ws = data.ws;
                var player = { x: 1.5 + 1 - slideThreshold, y: 0.5 };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "south");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(2.5);
                        expect(response['y']).to.equal(player['y'] + playerVelocity);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(top, east)]', function(done){
                ws = data.ws;
                var player = { x: 0.5, y: 1.5 - 1 + slideThreshold };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "east");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x'] + playerVelocity);
                        expect(response['y']).to.equal(0.5);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(bottom, east)]', function(done){
                ws = data.ws;
                var player = { x: 0.5, y: 1.5 + 1 - slideThreshold };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], "east");
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x'] + playerVelocity);
                        expect(response['y']).to.equal(2.5);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(top, west)]', function(done){
                ws = data.ws;
                var player = { x: 2.5, y: 1.5 - 1 + slideThreshold };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], 'west');
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x'] - playerVelocity);
                        expect(response['y']).to.equal(0.5);
                        done();
                    }
                };

                StartTesting();
             });

            it('should successfully move player[wall sliding(bottom, west)]', function(done){
                ws = data.ws;
                var player = { x: 2.5, y: 1.5 + 1 - slideThreshold };

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        MovePlayer(player['sid'], 'west');
                        Sleep(tickDuration * 2.5, Examine, player['id']);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        expect(response['x']).to.equal(player['x'] - playerVelocity);
                        expect(response['y']).to.equal(2.5);
                        done();
                    }
                };

                StartTesting();
             });

            after(function(done) {
                tester.send({action: 'logout', sid: data.ssid}, function() { done(); });
            });

      });
    }


    return {
      Test: Test
    }
});