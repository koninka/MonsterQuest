$(function(){
   var sid = getQueryVariable('sid');
   if (!sid) {
      window.location.assign("/")
   }
   $.post(
      "/json",
      {
         uid : sid,
         action: 'getSocket'
      },
      function(data) {
         alert(data);
         if (data['result']) {
            // OpenSocket()
         }
      },
      "json"
   );
});