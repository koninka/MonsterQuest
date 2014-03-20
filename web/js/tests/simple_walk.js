define(['tester'], function(tester) {
   var ws       = null;
   var sid      = null;
   var data     = null;
   var wsuri    = null;
   var login    = null;
   var expect   = chai.expect;
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
            sid = data['sid'];
            wsuri = data['soсket'];
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
         onopen = function() {
            console.log("ok");
            done();
         }
         ws = WSConnect(wsuri, null, onopen, null, null)
      });
      var ticks;
      it('should successfully get tick', function(done) {
         onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (data['tick']) {
               done();
            }
         }
         ws = WSConnect(wsuri, null, null, null, onmessage);
      });
   });

   return {
      updateData: updateData
   }
});