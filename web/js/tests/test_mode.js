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

   describe('Server on test mode', function() {
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
            wsuri    = data['webSoсket'];
            actor_id = data['id'];
            done();
         });
      });
   });

   return {
      updateData: updateData
   }
});