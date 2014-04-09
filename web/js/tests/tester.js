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
      data.password = getRandomString()
   }


   function regAndLog(data){
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
         data.ssid     = response['sid'];
         data.wsuri    = response['webSocket'];
         data.actor_id = response['id'];
         data.ws       = wsock(data.wsuri, null, null, null, null);
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