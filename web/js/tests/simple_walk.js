define(['tester', 'utils/ws'], function(tester, wsock) {
   var ws       = null;
   var data     = null;
   var ssid     = null;
   var wsuri    = null;
   var login    = null;
   var expect   = chai.expect;
   var actor_id = null;
   var password = null;

   function updateData() {
      login = 'tester' + tester.getRandomString();
      password = tester.getRandomString()
   }

   function Test(){
      updateData();
      describe('Simple walk', function() {
         it('should successfully register', function(done) {
            data = {
               'login'    : login,
               'password' : password,
               'action'   : 'register'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('ok');
               done();
            });
         });
         it('should successfully login', function(done) {
            data = {
               'action'   : 'login',
               'password' : password,
               'login'    : login
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('ok');
               ssid     = data['sid'];
               wsuri    = data['webSocket'];
               actor_id = data['id'];
               done();
            });
         });
         it('should successfully connected via websocket', function(done) {
            onopen = function() {
               console.log("ok");
               done();
            }
            ws = wsock(wsuri, null, onopen, null, null);
         });
         var ticks;
         it('should successfully get tick', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['tick']) {
                  ws.onmessage = undefined;
                  done();
               }
            }
         });
         it('should fail get dictionary by badSid', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'getDictionary') {
                  expect(data['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "getDictionary", sid: '1231'});
         });
         it('should successfully get dictionary', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == "getDictionary") {
                  expect(data.dictionary).to.have.property('.', 'grass');
                  expect(data.dictionary).to.have.property('#', 'wall');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "getDictionary", sid: ssid});
         });
         it('should fail examine by badSid', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'examine') {
                  expect(data['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "examine", sid: 'fdsf'});
         });
         it('should fail examine by badId', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'examine') {
                  expect(data['result']).to.equal('badId');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "examine", sid: ssid, id: 10000000});
         });
         it('should successfully make self examine', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'examine') {
                  expect(data['result']).to.equal('ok');
                  expect(data['id']).to.equal(actor_id);
                  expect(data['type']).to.equal('player');
                  expect(data['login']).to.equal(login);
                  expect(data['x']).to.be.at.least(0);
                  expect(data['y']).to.be.at.least(0);
                  expect(data).to.have.property('health');
                  expect(data).to.have.property('maxHealth')
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "examine", sid: ssid, id: actor_id});
         });
         it('should fail look by badSid', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'look') {
                  expect(data['result']).to.equal('badSid');
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "look", sid: 'fds'});
         });
         it('should successfully self look and should contain positive player coordinates', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'look') {
                  expect(data['x']).to.be.at.least(0);
                  expect(data['y']).to.be.at.least(0);
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "look", sid: ssid});
         });
         it('should successfully self look and should contain map and actors keys', function(done) {
            ws.onmessage = function(e) {
               var data = JSON.parse(e.data);
               if (data['action'] == 'look') {
                  expect(data).to.have.property('map');
                  expect(data).to.have.property('actors')
                  ws.onmessage = undefined;
                  done();
               }
            }
            ws.sendJSON({action: "look", sid: ssid});
         });
      });
   }

   return {
      Test: Test
   }
});