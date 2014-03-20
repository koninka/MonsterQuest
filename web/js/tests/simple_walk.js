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
            wsuri    = data['soсket'];
            actor_id = data['id'];
            done();
         });
      });
      //onload = function(){
      //    done();
      //}
      //onmessage = function(){
      //    var data = JSON.parse(e.data);
      //    if(data['ticks'])
      //        done();
      //}
      //onclose = function(e){
      //
      //}
      it('should successfully connected via websocet', function(done) {
         console.log("ok");
         onopen = function() {
            console.log("ok");
            done();
            ws.close();
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, null);
      });
      var ticks;
      it('should successfully get tick', function(done) {
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (data['tick']) {
               done();
               ws.close();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, null, null, onmessage);
      });
      it('should fail get dictionary by badSid', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "getDictionary", sid: '1231'});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('badSid');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully get dictionary', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "getDictionary", sid: ssid});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data).to.have.property('.', 'grass');
               expect(data).to.have.property('#', 'wall');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should fail examine by badSid', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: 'fdsf'});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('badSid');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should fail examine by badId', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: ssid, id: 0});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('badId');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully examine ', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: ssid, id: actor_id});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('ok');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully examine and login not be empty', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: ssid, id: actor_id});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('ok');
               expect(data['login']).to.not.be.empty;
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully examine and type must be player', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: ssid, id: actor_id});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('ok');
               expect(data['type']).to.equal('player');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully examine and coordinates must be positive', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "examine", sid: ssid, id: actor_id});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('ok');
               expect(data['x']).to.be.at.least(0);
               expect(data['y']).to.be.at.least(0);
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should fail look by badSid', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "look", sid: 'fds'});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['result']).to.equal('badSid');
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully look and should contain positive player coordinates', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "look", sid: ssid});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['x']).to.be.at.least(0);
               expect(data['y']).to.be.at.least(0);
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
      it('should successfully look and should contain map and actors keys', function(done) {
         onopen = function(e) {
            ws.sendJSON({action: "look", sid: ssid});
         }
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (!data['tick']) {
               expect(data['map']).to.not.be.empty;
               expect(data['actors']).to.not.be.empty;
               ws.close();
               done();
            }
         }
         ws = wsock.getNewSocket(wsuri, null, onopen, null, onmessage);
      });
   });

   return {
      updateData: updateData
   }
});