define(['tester'], function(tester) {
   var sid      = null;
   var data     = null;
   var login    = null;
   var expect   = chai.expect;
   var password = null;

   function updateData() {
      login = 'tester' + tester.getRandomString();
      password = tester.getRandomString()
   }

   function Test(){
      updateData();
      describe('Registration', function() {
         it('should fail register by badLogin[empty]', function(done) {
            data = {
            'login'    : '',
            'password' : '',
            'action'   : 'register'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
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
         it('should fail register by loginExists', function(done) {
            data = {
               'login'    : login,
               'password' : password,
               'action'   : 'register'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('loginExists');
               done();
            });
         });
         it('should fail register by badLogin[short]', function(done) {
            data = {
            'login'    : 'e',
            'password' : password,
            'action'   : 'register'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badLogin[short]', function(done) {
            data['login'] = '+e';
            data['password'] = '112345';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badLogin[long]', function(done) {
            data['login'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            data['password'] = '-------------';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badLogin[unsupported chars]', function(done) {
            data['login'] = '+-/:::-;-*&^';
            data['password'] = '-------------';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badLogin[long]', function(done) {
            data['login'] = '1111111111111111111111111111111111111';
            data['password'] = '-------------';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badLogin[long]', function(done) {
            data['login'] = '1111111111111111111111111111111111111';
            data['password'] = '-------------';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badLogin');
               done();
            });
         });
         it('should fail register by badPassword[short]', function(done) {
            data['login'] = login + 1;
            data['password'] = 'c';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badPassword');
               done();
            });
         });
         it('should fail register by badPassword[long]', function(done) {
            data['login'] = login + 1;
            data['password'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badPassword');
               done();
            });
         });
      });

      describe('Login', function() {
         it('should successfully login', function(done) {
            data = {
               'login'    : login,
               'password' : password,
               'action'   : 'login'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('ok');
               expect(data).to.have.property('id');
               expect(data).to.have.property('sid');
               expect(data).to.have.property('webSocket');
               expect(data).to.have.property('fistId');
               sid = data['sid'];
               done();
            });
         });
         it('should fail login by invalidCredentials[wrong login]', function(done) {
            data = {
               'login'    : '_',
               'password' : password,
               'action'   : 'login'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('invalidCredentials');
               done();
            });
         });
         it('should fail login by invalidCredentials[wrong password]', function(done) {
            data = {
            'login'    : login,
            'password' : '_',
            'action'   : 'login'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('invalidCredentials');
               done();
            });
         });
         it('should successfully logout', function(done) {
            data = {
            'sid'    : sid,
            'action' : 'logout'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('ok');
               done();
            });
         });
         it('should fail logout by badSid', function(done) {
            data = {
               'sid'    : sid,
               'action' : 'logout'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badSid');
               done();
            });
         });
         it('should fail logout by badSid', function(done) {
            data = {
            'sid'    : '',
            'action' : 'logout'
            }
            tester.send(data, function (data) {
               expect(data['result']).to.equal('badSid');
               done();
            });
         });
      })
   }
   return {
      Test: Test
   }
});