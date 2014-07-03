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
   var tickDuration = 1000 / 50;

   function Prepare() {
      tester.updateData(data);
      tester.registerAndLogin(data);
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

   function SetUpConstants(playerVelocity, ticksPerSecond) {
      SendViaWS({
         action: "setUpConst", 
         playerVelocity: playerVelocity,
         ticksPerSecond: ticksPerSecond
      });
   }

   function GetConstants() {
      SendViaWS({action: "getConst"});
   }

   function SetUpMap(map) {
      SendViaWS({action: "setUpMap", map: map});
   }

   function PutMob(x, y, race, flags, inventory, characteristics) {
      flags = flags || [];
      inventory = inventory || [];
      characteristics = characteristics || {};
      SendViaWS({
         action: "putMob",
         x: x,
         y: y,
         flags: flags,
         race: race,
         inventory: inventory,
         characteristics: characteristics
      });
   }

   function MoveActor(actor_id, direction) {
      SendViaWS({
         action: "makeMove",
         id: actor_id,
         direction: direction
      });
   }

   function Examine(id) {
      SendViaWS({action: "examine", id: id});
   }

   function Sleep(time, callback, param) {
      setTimeout(function() { callback(param); }, time)
   }

   function GetShiftByDir(dir) {
      var v = 0.12;
      switch (dir) {
         case "north": 
            return [0, - v];
         case "south":
            return [0, v];
         case "west":
            return [- v, 0];
         case "east":
            return [v, 0];
      }
   }

   function Test(){
      Prepare();
      describe('Move flag', function() {

          it('should successfully move mob in all directions', function(done){
            ws = data.ws;
            var mob = { x: 1.5, y: 1.5 };
            var moveCounter = 0;
            var dirs = ["north", "south", "west", "east"];

            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  SetUpConstants(0.12, 50);
                  SetUpMap([
                        [".", ".", ".", "."],
                        [".", ".", ".", "."],
                        [".", ".", ".", "."],
                        [".", ".", ".", "."]
                     ]);
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutMob(mob['x'], mob['y'], "DEVIL", ["CAN_MOVE"]);
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('ok');
                  expect(response['id']).to.be.at.least(1);
                  mob['id'] = response['id'];
                  MoveActor(mob['id'], dirs[moveCounter++]);
                  Sleep(tickDuration * 2, Examine, mob['id']);
               } else if (response['action'] == 'examine') {
                  var shift = GetShiftByDir(dirs[moveCounter - 1]);
                  mob['x'] += shift[0];
                  mob['y'] += shift[1];
                  expect(response['result']).to.equal('ok');
                  expect(response['x']).to.equal(mob['x']);
                  expect(response['y']).to.equal(mob['y']);
                  if (moveCounter < dirs.length) {
                     MoveActor(mob['id'], dirs[moveCounter++]);
                     Sleep(tickDuration * 2, Examine, mob['id']);
                  } else 
                     StopTesting();
               } else if (response['action'] == 'stopTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            StartTesting();
         });

      }); 
   }


   return {
      Test: Test
   }
});