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


   function Prepare(){
      tester.updateData(data);
      tester.registerAndLogin(data);
   }

   function Test(){
      Prepare();

      describe('Beginning and end of the test mode', function() {

         it('should take badSid on startTesting', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "startTesting", sid: "10000000"});
         })

         it('should take badSid[not a string] on startTesting', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "startTesting", sid: 1000000});
         })

         it('should take badSid[no sid send] on startTesting', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "startTesting"});
         })


         it('should successfully activate test mode', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "startTesting", sid: data.ssid});
         })

         it('should take badAction[double activation] on startTesting', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('badAction');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "startTesting", sid: data.ssid});
         })

         it('should fail end test mode by badSid', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'stopTesting') {
                  expect(response['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "stopTesting"});
         })

         it('should successfully end test mode', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'stopTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "stopTesting", sid: data.ssid});
         })

         it('should fail end test mode[not activated test mode]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'stopTesting') {
                  expect(response['result']).to.equal('badAction');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "stopTesting", sid: data.ssid});
         })

      });

      describe('Functions of the test mode', function() {

         afterEach(function(){
            data.ws.onmessage = undefined;
            data.ws.sendJSON({action: "stopTesting", sid: data.ssid});
         });

         it('should successfully load map', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [["#"], ["#"], ["#"]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'stopTesting', sid: data.ssid});
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should successfully load map', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [
                     ["#", "#", "#", "#"],
                     ["#", ".", ".", "#"],
                     ["#", ".", ".", "#"],
                     ["#", "#", "#", "#"]
                     ], sid: data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[null map]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[empty map]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[empty map]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[], [], [], []], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[symbol out of dictionary]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [["#"], ["#"], ["A"]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[unequal columns count in rows]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [["#", "#"], ["#"], ["#"]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail load map[unequal columns count in rows]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [["#", "#"], ["#", "#"], ["#", "#"], []], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should get constants', function(done){
            ws = data.ws;
            this.timeout(4000);
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'getConst', sid: data.ssid});
               } else if (response['action'] == 'getConst') {
                  expect(response['result']).to.equal('ok');
                  expect(Object.keys(response).length).to.equal(8);
                  expect(response).to.have.property('playerVelocity');
                  expect(response).to.have.property('slideThreshold');
                  expect(response).to.have.property('ticksPerSecond');
                  expect(response).to.have.property('screenRowCount');
                  expect(response).to.have.property('screenColumnCount');
                  expect(response).to.have.property('pickUpRadius');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should set up constants', function(done){
            ws = data.ws;
            this.timeout(4000);
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpConst',
                     playerVelocity: 0,
                     slideThreshold: 0,
                     ticksPerSecond: 1,
                     screenRowCount: 0,
                     screenColumnCount: 0,
                     pickUpRadius: 0,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should set up constants and check it', function(done){
            ws = data.ws;
            var consts = {
               playerVelocity: 0,
               slideThreshold: 0,
               ticksPerSecond: 1,
               screenRowCount: 0,
               screenColumnCount: 0,
               pickUpRadius: 0
            };
            this.timeout(5000);
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  var req = { action: 'setUpConst', sid: data.ssid };
                  for (var name in consts) {
                     req[name] = consts[name];
                  }
                  ws.sendJSON(req);
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'getConst', sid: data.ssid});
               } else if (response['action'] == 'getConst') {
                  expect(response['result']).to.equal('ok');
                  for (var name in consts) {
                     expect(response[name]).to.equal(consts[name]);
                  }
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should load map and then put mob', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpMap',
                     map:
                        [
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                           [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: "putMob",
                     x: 0.5,
                     y: 0.5,
                     characteristics: { HP: 100 },
                     flags: [],
                     inventory: [],
                     race: "DEVIL",
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should load map and then put mobs in all cells', function(done){
            ws = data.ws;
            var map = [
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
               [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            ];
            var counter = 0;
            var cellsCount = (map.length - 1) * (map[0].length - 1);
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                  action: 'setUpMap',
                  map: map,
                  sid : data.ssid
               });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  for (var i = 0; i < map.length - 1; i++)
                  {
                     for (var j = 0; j < map[i].length - 1; j++)
                     ws.sendJSON({
                        action: "putMob",
                        x: j + 0.5,
                        y: i + 0.5,
                        flags: [],
                        race: "DEVIL",
                        sid: data.ssid
                     });
                  }
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('ok');
                  counter++;
                  if (counter == cellsCount)
                     done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[not map loaded]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                   ws.sendJSON({
                     action: "putMob",
                     x: 0.5,
                     y: 0.5,
                     flags: [],
                     race: "DEVIL",
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPoint');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[put mob to wall]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpMap',
                     map:
                        [
                           ["#", "#", "#"],
                           ["#", "#", "#"],
                           ["#", "#", "#"],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: "putMob",
                     x: 1.5,
                     y: 1.5,
                     flags: [],
                     race: "DEVIL",
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPoint');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[cross with another mob]', function(done){
            ws = data.ws;
            var counter = 0;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpMap',
                     map:
                        [
                           [".", ".", "."],
                           [".", ".", "."],
                           [".", ".", "."],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: "putMob",
                     x: 1.5,
                     y: 1.5,
                     flags: [],
                     race: "DEVIL",
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putMob') {
                  if (counter == 0)
                  {
                     expect(response['result']).to.equal('ok');
                     ws.sendJSON({
                        action: "putMob",
                        x: 2.0,
                        y: 2.0,
                        flags: [],
                        race: "DEVIL",
                        sid: data.ssid
                     });
                  } else {
                     expect(response['result']).to.equal('badPoint');
                     done();
                  }
                  counter++;
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

      });
   }


   return {
      Test: Test
   }
});