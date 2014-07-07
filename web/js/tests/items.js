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
    var pickUpRadius = 2.0;

    function Prepare(done) {
      tester.updateData(data);
      tester.registerAndLogin(data, done);
    }

    function SendViaWS(obj) {
      obj["sid"] = data.ssid;
      ws.sendJSON(obj);
    }

    function StartTesting() {
        SendViaWS({action: "startTesting"});
    }

    function StopTesting() {
        SendViaWS({action: "stopTesting"});
    }

    function SetUpConstants(playerVelocity_, ticksPerSecond_, slideThreshold_, pickUpRadius_) {
        playerVelocity_ = playerVelocity_ || playerVelocity;
        slideThreshold_ = slideThreshold_ || slideThreshold;
        ticksPerSecond_ = ticksPerSecond_ || ticksPerSecond;
        pickUpRadius_ = pickUpRadius_ || pickUpRadius;
        SendViaWS({
            action: "setUpConst",
            playerVelocity: playerVelocity_,
            ticksPerSecond: ticksPerSecond_,
            slideThreshold: slideThreshold_,
            pickUpRadius: pickUpRadius_
        });
    }

    function GetConstants() {
      SendViaWS({action: "getConst"});
    }

    function SetUpMap(map) {
      SendViaWS({action: "setUpMap", map: map});
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

    function PutItem(x, y, weight, iClass, type, bonuses, effects, subtype) {
        SendViaWS({
            action: "putItem",
            x: x,
            y: y,
            item: MakeItem(weight, iClass, type, bonuses, effects, subtype)
        });
    }

    function MakeItem(weight, iClass, type, bonuses, effects, subtype) {
        weight = weight || 1;
        iClass = iClass || "garment";
        type = type || "shield";
        bonuses = bonuses || [];
        effects = effects || [];
        var item = {
            weight: weight,
            "class": iClass,
            type: type,
            bonuses: bonuses,
            effects: effects
        };
        if (subtype) {
            item["subtype"] = subtype;
        }
        return item;
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

    function PickUp(sid, id) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "pickUp",
                id: id
            }
        });
    }

    function Drop(sid, id) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "drop",
                id: id
            }
        });
    }

    function Use(sid, id) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "use",
                id: id
            }
        });
    }

    function Destroy(sid, id) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "destroyItem",
                id: id
            }
        });
    }

    function Equip(sid, id, slot) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "equip",
                id: id,
                slot: slot
            }
        });
    }

    function Unequip(sid, slot) {
        SendViaWS({
            action: "enforce",
            enforcedAction: {
                sid: sid,
                action: "unequip",
                slot: slot
            }
        });
    }

    function Examine(id, sid) {
        if (!sid)
            SendViaWS({action: "examine", id: id});
        else 
            SendViaWS({
                action: "enforce",
                enforcedAction: {
                    sid: sid,
                    action: "examine",
                    id: id
                }
            });
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

        describe('Items', function() {

            afterEach( function(done) {
                ws.onmessage = function(e){
                    var resp = JSON.parse(e.data);
                    if(resp['action'] == 'stopTesting')
                        done();
                };
                ws.sendJSON({action: "stopTesting", sid: data.ssid});
            });

            it('should successfully pick up item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        PickUp(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail pick up item[too far]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
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
                        PutItem(player['x'] + pickUpRadius + 1, player['y'] + pickUpRadius + 1);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        PickUp(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail pick up item[player already has it in inventory]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ]);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        PickUp(player['sid'], item_id)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail pick up item[object doesn\'t exists]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        PickUp(player['sid'], 34535345)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should successfully destroy item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        Destroy(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        Sleep(tickDuration * 3, Examine, item_id);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should successfully destroy item in inventory', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ]);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        Destroy(player['sid'], item_id)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail destroy item[object doesn\'t exists]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        Destroy(player['sid'], -1)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail destroy item[too far]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
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
                        PutItem(player['x'] + pickUpRadius + 1, player['y'] + pickUpRadius + 1);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        Destroy(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        Sleep(tickDuration * 3, Examine, item_id);
                    } else if (response['action'] == 'examine') {
                        expect(response['result']).to.equal('ok');
                        done();
                    }
                };

                StartTesting();
            });

            it('should successfully drop item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ]);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        Drop(player['sid'], item_id)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail drop item[player hasn\'t it in inventory]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
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
                        PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        Drop(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail drop item[object doesn\'t exists]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        Drop(player['sid'], -1)
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('badId');
                        done();
                    }
                };

                StartTesting();
            });

            it('should fail pick up item[item in other player\'s inventory]', function(done) {
                ws = data.ws;
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player1['x'], player1['y'], [ MakeItem() ]);
                        PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            PickUp(player2['sid'], item_id);
                        }
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'pickUp') {
                            expect(response['actionResult']['result']).to.equal('badId');
                            Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                };

                StartTesting();
            });

            it('should fail destroy item[item in other player\'s inventory]', function(done) {
                ws = data.ws;
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player1['x'], player1['y'], [ MakeItem() ]);
                        PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            Destroy(player2['sid'], item_id);
                        }
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'destroyItem') {
                            expect(response['actionResult']['result']).to.equal('badId');
                            Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                };

                StartTesting();
            });

            it('should fail drop item[item in other player\'s inventory]', function(done) {
                ws = data.ws;
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                ws.onmessage = function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == 'startTesting') {
                        expect(response['result']).to.equal('ok');
                        SetUpConstants();
                        SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == 'setUpConst') {
                        expect(response['result']).to.equal('ok');
                    } else if (response['action'] == 'setUpMap') {
                        expect(response['result']).to.equal('ok');
                        PutPlayer(player1['x'], player1['y'], [ MakeItem() ]);
                        PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            Drop(player2['sid'], item_id);
                        }
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'drop') {
                            expect(response['actionResult']['result']).to.equal('badId');
                            Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                };

                StartTesting();
            });

            it('should fail pick up item[too heavy]', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [], { STRENGTH : 1 });
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        PutItem(player['x'] + 1, player['y'] + 1, 1000);
                    } else if (response['action'] == 'putItem') {
                        expect(response['result']).to.equal('ok');
                        item_id = response['id'];
                        PickUp(player['sid'], item_id);
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'pickUp') {
                            expect(response['actionResult']['result']).to.equal('tooHeavy');
                            Examine(player['id'], player['sid']);    
                        } else {
                            expect(response['actionResult']['inventory'].length).to.equal(0);
                            done();
                        }                        
                    }
                };

                StartTesting();
            });

            it('should successfully equip item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ]);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        Equip(player['sid'], item_id, "LEFT-HAND");
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'equip') {
                            Examine(player['id'], player['sid']);
                        } else {
                            expect(response['actionResult']['slots']['LEFT-HAND']['id']).to.equal(item_id);
                            done();
                        }
                    }
                };

                StartTesting();
            });

            it('should successfully unequip item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ], {}, { 'LEFT-HAND' : MakeItem() });
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        Unequip(player['sid'], "LEFT-HAND");
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'unequip') {
                            Examine(player['id'], player['sid']);
                        } else {
                            expect(response['actionResult']['slots']['LEFT-HAND']).to.equal(undefined);
                            done();
                        }
                    }
                };

                StartTesting();
            });

            it('should successfully equip/unequip item', function(done) {
                ws = data.ws;
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;
                var first = true;

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
                        PutPlayer(player['x'], player['y'], [ MakeItem() ]);
                    } else if (response['action'] == 'putPlayer') {
                        expect(response['result']).to.equal('ok');
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        Equip(player['sid'], item_id, "LEFT-HAND");
                    } else if (response['action'] == 'enforce') {
                        expect(response['result']).to.equal('ok');
                        expect(response['actionResult']['result']).to.equal('ok');
                        if (response['actionResult']['action'] == 'equip') {
                            Examine(player['id'], player['sid']);
                        } else if (response['actionResult']['action'] == 'examine') {
                            if (first) {
                                first = false;
                                expect(response['actionResult']['slots']['LEFT-HAND']['id']).to.equal(item_id);
                                Unequip(player['sid'], 'LEFT-HAND');
                            } else {
                                expect(response['actionResult']['slots']['LEFT-HAND']).to.equal(undefined);
                                done();
                            }
                        } else if (response['actionResult']['action'] == 'unequip') {
                            expect(response['actionResult']['result']).to.equal('ok');
                            Examine(player['id'], player['sid']);
                        }
                    }
                };

                StartTesting();
            });



        });

        after(function(done) {
                tester.send({action: 'logout', sid: data.ssid}, function() { done(); });
        });
    }


    return {
      Test: Test
    }
});