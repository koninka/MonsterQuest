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
      describe('Test mode', function() {

          it('should take badSid', function(done){
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

         it('should take badSid[not a string]', function(done){
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

         it('should take badSid[no sid send]', function(done){
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

         
         it('should activate test mode', function(done){
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

         it('should take badAction[double activation]', function(done){
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
               if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "endTesting"});
         })

         it('should end test mode', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "endTesting", sid: data.ssid});
         })

         it('should fail end test mode[double ending]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {

               var response = JSON.parse(e.data);
               console.log(response);
               if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('badAction');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "endTesting", sid: data.ssid});
         })

         it('should load map', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [["#"], ["#"], ["#"]], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should load map', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [
               ["#", "#", "#", "#"], 
               ["#", ".", ".", "#"], 
               ["#", ".", ".", "#"],
               ["#", "#", "#", "#"]
               ], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });
        
         it('should fail load map[null map]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should fail load map[empty map]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should fail load map[empty map]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [[], [], [], []], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should fail load map[symbol out of dictionary]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [["#"], ["#"], ["A"]], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should fail load map[unequal columns count in rows]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [["#", "#"], ["#"], ["#"]], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should fail load map[unequal columns count in rows]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('badMap');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'setUpMap', map: [["#", "#"], ["#", "#"], ["#", "#"], []], sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should get constants', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'getConst') {
                  expect(response['result']).to.equal('ok');
                  expect(Object.keys(response).length).to.equal(7);
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON({action: 'getConst', sid: data.ssid});
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });

         it('should set up constants', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
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
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
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

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('ok');
               } else if (response['action'] == 'getConst') {
                  expect(response['result']).to.equal('ok');
                  for (var name in consts) {
                     expect(response[name]).to.equal(consts[name]);
                  }
               } else if (response['action'] == 'endTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.onmessage = undefined;
                  done();
               }
            };
            var req = { action: 'setUpConst', sid: data.ssid };
            for (var name in consts)
               req[name] = consts[name];
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
            ws.sendJSON(req);
            ws.sendJSON({action: 'endTesting', sid: data.ssid});
         });
      }); 
   }
   

   return {
      Test: Test
   }
});