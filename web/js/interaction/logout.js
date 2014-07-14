define(['jquery', 'utils/utils'], function(JQuery, utils) {
   function logoutSuccess(data, textStatus, jqXHR) {
      if(data['result'] == 'ok'){
         //utils.gameShutDown("You have successfully logged out");
      } else if(data['result'] == 'badSid'){
         //utils.gameShutDown("You have successfully logged out");
      } else {
         alert('Нет ответа от сервера');
      }
   }

   $(function(){
      $("#logout").click(function() {
         utils.sendRequest({action: 'logout', sid: utils.getQueryVariable('sid')}, logoutSuccess, utils.getQueryVariable('srv'));
      });
   });
})