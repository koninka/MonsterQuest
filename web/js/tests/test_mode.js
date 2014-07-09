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
   var default_damage = "3d2";


   function Prepare(done){
      tester.updateData(data);
      tester.registerAndLogin(data, done);
   }

   function Logout(done){
        data.ws = undefined;
        tester.send({action: 'logout', sid:data.ssid}, function(){
            done();
        });
   }

   function PutItem(x, y, weight, iClass, type, bonuses, effects, subtype) {
        weight = 10 || weight;
        iClass = "garment" || iClass;
        type = "weapon" || type;
        bonuses = [] || bonuses;
        effects = [] || effects;
        var item = {
            weight: weight,
            class: iClass,
            type: type,
            bonuses: bonuses,
            effects: effects
        };
        if (subtype) {
            item["subtype"] = subtype
        }
        ws.sendJSON({
            action: "putItem",
            x: x,
            y: y,
            item: item,
            sid: data.ssid
        });
    }

   function SendViaWS(obj) {
      obj["sid"] = data.ssid;
      ws.sendJSON(obj);
      console.log(obj);
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

   function Test(){

    describe('Test mode', function(){



    before(Prepare);

    after(Logout);

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

        

         afterEach(function(done){
            data.ws.onmessage = function(e){
                var resp = JSON.parse(e.data);
                if(resp['action'] == 'stopTesting')
                    done();
            };
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

         it('should fail set up constants[some constants are not numbers]', function(done){
            ws = data.ws;
            this.timeout(4000);
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpConst',
                     playerVelocity: '43',
                     slideThreshold: '4',
                     ticksPerSecond: 'ticksPerSecond',
                     screenRowCount: '500',
                     screenColumnCount: 0,
                     pickUpRadius: '4f',
                     sid: data.ssid
                  });
               } else if (response['action'] == 'setUpConst') {
                  expect(response['result']).to.equal('badAction');
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
                  PutMob(0.5, 0.5, "ORC", undefined, [], [], { HP: 100 });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should load map and then put mobs with all possible races', function(done){
            ws = data.ws;
            var possible_races = ["ORC", "EVIL", "TROLL", "GIANT", "DEMON", "METAL", "DRAGON", "UNDEAD", "ANIMAL", "PLAYER"];
            var counter = 0;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpMap',
                     map: [
                        [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."]
                     ],
                     sid: data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  for (var i = 0; i < possible_races.length; i++) {
                     PutMob(0.5 + i, 0.5, possible_races[i], undefined, [], [], { HP: 100 });
                  }
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('ok');
                  counter++;
               }
               if (counter == possible_races.length) {
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });


         it('should fail put mob[badRace]', function(done){
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
                           [".", ".", "."],
                           [".", ".", "."],
                           [".", ".", "."],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutMob(1.5, 1.5, "BAD RACE STRING");
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badRace');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[badPlacing, x and y are strings]', function(done){
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
                           [".", ".", "."],
                           [".", ".", "."],
                           [".", ".", "."],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutMob('x', 'y', "BAD RACE STRING");
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPlacing');
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
                  for (var i = 0; i < map.length - 1; i++) {
                     for (var j = 0; j < map[i].length - 1; j++) {
                        PutMob(j + 0.5, i + 0.5, "ORC");
                     }
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

         it('should fail put mob[bad damage string]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  PutMob(0.5, 0.5, "ORC", "f3f");
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badDamage');
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
                  PutMob(0.5, 0.5, "ORC");
                  //  ws.sendJSON({
                  //    action: "putMob",
                  //    x: 0.5,
                  //    y: 0.5,
                  //    flags: [],
                  //    race: "ORC",
                  //    sid: data.ssid
                  // });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPlacing');
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
                  PutMob(1.5, 1.5, "ORC");
                  // ws.sendJSON({
                  //    action: "putMob",
                  //    x: 1.5,
                  //    y: 1.5,
                  //    flags: [],
                  //    race: "ORC",
                  //    sid: data.ssid
                  // });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[cross mob with wall]', function(done){
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
                           ["#", ".", "#"],
                           ["#", "#", "#"],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutMob(1.7, 1.7, "ORC");
                  // ws.sendJSON({
                  //    action: "putMob",
                  //    x: 1.7,
                  //    y: 1.7,
                  //    flags: [],
                  //    race: "ORC",
                  //    sid: data.ssid
                  // });
               } else if (response['action'] == 'putMob') {
                  expect(response['result']).to.equal('badPlacing');
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
                  PutMob(1.5, 1.5, "ORC");
               } else if (response['action'] == 'putMob') {
                  if (counter == 0) {
                     expect(response['result']).to.equal('ok');
                     PutMob(2.0, 2.0, "ORC");
                  } else {
                     expect(response['result']).to.equal('badPlacing');
                     done();
                  }
                  counter++;
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put mob[mobs\' centers are same]', function(done){
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
                  PutMob(1.5, 1.5, "ORC");
               } else if (response['action'] == 'putMob') {
                  if (counter == 0) {
                     expect(response['result']).to.equal('ok');
                     PutMob(1.5, 1.5, "ORC", undefined, [], [], { HP: 100 });
                  } else {
                     expect(response['result']).to.equal('badPlacing');
                     done();
                  }
                  counter++;
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should load map and then put player', function(done){
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
                     action: "putPlayer",
                     x: 0.5,
                     y: 0.5,
                     characteristics: { HP: 100 },
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('ok');
                  expect(response).to.have.property('sid');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should put two players and get different sids', function(done){
            ws = data.ws;
            var firstPlayer = true;
            var firstSID = null;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: 'setUpMap',
                     map:
                        [
                           [".", ".", ".", "."],
                           [".", ".", ".", "."],
                           [".", ".", ".", "."],
                           [".", ".", ".", "."]
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: "putPlayer",
                     x: 0.5,
                     y: 0.5,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('ok');
                  expect(response).to.have.property('sid');
                  if (firstPlayer) {
                     firstPlayer = false;
                     firstSID = response['sid'];
                     ws.sendJSON({
                        action: "putPlayer",
                        x: 2.5,
                        y: 2.5,
                        sid: data.ssid
                     });
                  } else {
                     expect(firstSID).to.not.be.equal(response['sid']);
                     done();
                  }
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should load map and then put players in all cells', function(done){
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
                        action: "putPlayer",
                        x: j + 0.5,
                        y: i + 0.5,
                        sid: data.ssid
                     });
                  }
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('ok');
                  counter++;
                  if (counter == cellsCount)
                     done();
               }
            };

            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put player[not map loaded]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                   ws.sendJSON({
                     action: "putPlayer",
                     x: 0.5,
                     y: 0.5,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put player[badPlacing, x and y are strings]', function(done){
            ws = data.ws;

            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               console.log(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                   ws.sendJSON({
                     action: "putPlayer",
                     x: 'x',
                     y: 'y',
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put player[put player to wall]', function(done){
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
                     action: "putPlayer",
                     x: 1.5,
                     y: 1.5,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put player[cross player with wall]', function(done){
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
                           ["#", ".", "#"],
                           ["#", "#", "#"],
                        ],
                     sid : data.ssid
                  });
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({
                     action: "putPlayer",
                     x: 1.7,
                     y: 1.7,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put second player[cross with first player]', function(done){
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
                     action: "putPlayer",
                     x: 1.5,
                     y: 1.5,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  if (counter == 0)
                  {
                     expect(response['result']).to.equal('ok');
                     ws.sendJSON({
                        action: "putPlayer",
                        x: 2.0,
                        y: 2.0,
                        sid: data.ssid
                     });
                  } else {
                     expect(response['result']).to.equal('badPlacing');
                     done();
                  }
                  counter++;
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put players[players\' centers are same]', function(done){
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
                     action: "putPlayer",
                     x: 1.5,
                     y: 1.5,
                     sid: data.ssid
                  });
               } else if (response['action'] == 'putPlayer') {
                  if (counter == 0)
                  {
                     expect(response['result']).to.equal('ok');
                     ws.sendJSON({
                        action: "putPlayer",
                        x: 1.5,
                        y: 1.5,
                        sid: data.ssid
                     });
                  } else {
                     expect(response['result']).to.equal('badPlacing');
                     done();
                  }
                  counter++;
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should successfully put item', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[".", "."], [".", "."], [".", "."]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutItem(0.5, 0.5)
               } else if (response['action'] == 'putItem') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should fail put item[badPlacing, x and y are string]', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[".", "."], [".", "."], [".", "."]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutItem('x', 'y')
               } else if (response['action'] == 'putItem') {
                  expect(response['result']).to.equal('badPlacing');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should successfully put item with bonus', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[".", "."], [".", "."], [".", "."]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutItem(0.5, 0.5, 100, "consumable", [{stat: "HP", effectCalculation: "const", value: 100}])
               } else if (response['action'] == 'putItem') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should successfully put item with ongoing effect', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[".", "."], [".", "."], [".", "."]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutItem(0.5, 0.5, 100, "consumable", [], [{stat: "HP", type: "ongoing", value: 100, duration: 100}])
               } else if (response['action'] == 'putItem') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });

         it('should successfully put item with bonus effect', function(done){
            ws = data.ws;
            ws.onmessage = function(e) {
               var response = JSON.parse(e.data);
               if (response['action'] == 'startTesting') {
                  expect(response['result']).to.equal('ok');
                  ws.sendJSON({action: 'setUpMap', map: [[".", "."], [".", "."], [".", "."]], sid: data.ssid});
               } else if (response['action'] == 'setUpMap') {
                  expect(response['result']).to.equal('ok');
                  PutItem(0.5, 0.5, 100, "consumable", [], [{stat: "HP", type: "bonus", duration: 100,
                     bonus: {stat: "HP", effectCalculation: "const", value: 100}}])
               } else if (response['action'] == 'putItem') {
                  expect(response['result']).to.equal('ok');
                  done();
               }
            };
            ws.sendJSON({action: 'startTesting', sid: data.ssid});
         });
      });

    })
   }


   return {
      Test: Test
   }
});