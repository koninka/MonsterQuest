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

        
      }); 
   }
   

   return {
      Test: Test
   }
});