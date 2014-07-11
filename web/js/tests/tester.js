define(['utils/utils' , 'utils/ws'], function(utils, wsock) {
   var url = null;

   function send(data, callback) {
      utils.sendRequest(data, callback, url);
   }

   function setUrl(new_url) {
      url = new_url;
   }

   function getRandomString() {
      return utils.randstring();
   }

   function updateData(data) {
      data.login = 'tester' + getRandomString();
      data.password = getRandomString();
   }


   function waitForSocketConnection(socket, done){
        setTimeout(
            function () {
                if (socket.readyState === 1) {
                    if(done){
                        done();
                    }
                    return
                } else {
                    console.log("wait for connection...")
                    waitForSocketConnection(socket, done);
                }
            }, 
            5
        );
    }

   function regAndLog(data, done){
      send({
         'login'    : data.login,
         'password' : data.password,
         'action'   : 'register'
      }, null)
      send({
         'action'   : 'login',
         'password' : data.password,
         'login'    : data.login
      }, function (response){
         if(response["result"] == 'invalidCredentials')  return;
         data.ssid     = response['sid'];
         data.wsuri    = response['webSocket'];
         data.fist_id  = response['fistId'];
         data.actor_id = response['id'];
         data.ws       = wsock(data.wsuri, null, null, null, null);
         waitForSocketConnection(data.ws, done);
      })

   }

   return {
      send:             send,
      setUrl:           setUrl,
      getRandomString:  getRandomString,
      registerAndLogin: regAndLog,
      updateData:       updateData
   }
});