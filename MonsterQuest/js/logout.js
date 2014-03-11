function logoutSuccess(data, textStatus, jqXHR) {
   if(data['result'] == 'ok'){
      GameShutDown("You have successfully logged out");
   } else if(data['result'] == 'badSid'){
      GameShutDown("You have successfully logged out");
   } else {
      alert('Нет ответа от сервера');
   }
}

$(function(){
   $("#logout").click(function() {
      SendRequest({action: 'logout', sid: getQueryVariable('sid')}, logoutSuccess, getQueryVariable('srv'));
   });
});