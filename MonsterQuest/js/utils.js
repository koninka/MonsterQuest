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

function GameShutDown(message) {
   alert("Game is going shutdown due to " + message);
   window.location.assign("/");
}