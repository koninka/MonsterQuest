define(function() {
   function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
         var pair = vars[i].split('=');
         if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
         }
      }
      return null
   }

   function sendRequest(data, callback, url) {
      var url = url || "/json";
      $.ajax({
         method : "POST",
         url : url,
         data : JSON.stringify(data),
         success : callback
      });
   }

   function gameShutDown(message) {
      //alert("Game is going shutdown due to " + message);
      window.location.assign("/");
   }

   function randstring(){
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for( var i=0; i < 10; i++ ) {
         text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
   }

   return {
      randstring:       randstring,
      sendRequest:      sendRequest,
      gameShutDown:     gameShutDown,
      getQueryVariable: getQueryVariable
   }
})