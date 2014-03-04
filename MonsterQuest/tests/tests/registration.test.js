
var expect = chai.expect;

function randstring(){
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
var login = 'tester' + randstring();
var password = randstring();
var CallBack;
var data;
var url;

describe('Registration', function(){
    it('should fail register by badLogin[empty]', function(done){
        data = {
            'login'    : '',
            'password' : '',
            'action'   : 'register'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url);
    })
    it('should successfully register', function(done){
        data = {
            'login'    : login,
            'password' : password,
            'action'   : 'register'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('ok');
            done();
        }
        SendRequest(data, CallBack, url);
    })


    it('should fail register by loginExists', function(done){
        data = {
            'login'    : login,
            'password' : password,
            'action'   : 'register'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('loginExists');
            done();
        }
        SendRequest(data, CallBack, url);
    })
    it('should fail register by badLogin[short]', function(done){
        data = {
            'login'    : 'e',
            'password' : password,
            'action'   : 'register'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url);
    })
    it('should fail register by badLogin[short]', function(done){
        data['login'] = '+e';
        data['password'] = '112345';
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url)
    })

    it('should fail register by badLogin[long]', function(done){
        data['login'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        data['password'] = '-------------';
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url)
    })

    it('should fail register by badLogin[unsupported chars]', function(done){
        data['login'] = '+-/:::-;-*&^';
        data['password'] = '-------------';
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url)
    })

    it('should fail register by badLogin[long]', function(done){
        data['login'] = '1111111111111111111111111111111111111';
        data['password'] = '-------------';
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack, url)
    })

    it('should fail register by badLogin[long]', function(done){
        data['login'] = '1111111111111111111111111111111111111';
        data['password'] = '-------------';
        CallBack = function (data){
            expect(data['result']).to.equal('badLogin');
            done();
        }
        SendRequest(data, CallBack)
    })

    it('should fail register by badPassword[short]', function(done){
        data['login'] = login + 1;
        data['password'] = 'c';
        CallBack = function (data){
            expect(data['result']).to.equal('badPassword');
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should fail register by badPassword[long]', function(done){
        data['login'] = login + 1;
        data['password'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        CallBack = function (data){
            expect(data['result']).to.equal('badPassword');
            done();
        }
        SendRequest(data, CallBack, url);
    })
})

var sid = null;

describe('Login', function(){
    it('should successfully login', function(done){
        data = {
            'login'    : login,
            'password' : password,
            'action'   : 'login'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('ok');
            sid = data['sid'];
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should fail login by invalidCredentials[wrong login]', function(done){
        data = {
            'login'    : '_',
            'password' : password,
            'action'   : 'login'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('invalidCredentials');
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should fail login by invalidCredentials[wrong password]', function(done){
        data = {
            'login'    : login,
            'password' : '_',
            'action'   : 'login'
        }
        CallBack = function (data){
            expect(data['result']).to.equal('invalidCredentials');
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should successfully logout', function(done){
        data = {
            'action' : 'logout',
            'sid' : sid
        }
        CallBack = function (data){
            expect(data['result']).to.equal('ok');
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should fail logout by badSid', function(done){
        data = {
            'action' : 'logout',
            'sid' : sid
        }
        CallBack = function (data){
            expect(data['result']).to.equal('badSid');
            done();
        }
        SendRequest(data, CallBack, url);
    })

    it('should fail logout by badSid', function(done){
        data = {
            'action' : 'logout',
            'sid' : ''
        }
        CallBack = function (data){
            expect(data['result']).to.equal('badSid');
            done();
        }
        SendRequest(data, CallBack, url);
    })

})

/*describe('Registration', function(){
    it('', function(){
       expect(true).to.equal(false);
    }
})*/