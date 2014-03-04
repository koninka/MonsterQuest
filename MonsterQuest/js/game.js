var gameSock = null
var wsuri = "ws://localhost:8080/websocket";

function Point(x, y) {
   this.x = x;
   this.y = y;
}

var actor = {}

function ExamineSuccess(data) {
   console.log("examine success to " + data.result);
   // if (data.result != 'ok') {
   //    window.location.assign("/")
   // }
   actor.type = data.type;
   actor.login = data.login;
   actor.pt = new Point(data.x, data.y);
   actor.login = data.login;
}

function InitSocket() {
   gameSock = new WebSocket(wsuri);

   gameSock.onopen = function() {
      console.log("connected to " + wsuri);
   }

   gameSock.onclose = function(e) {
      alert('Выход через 3 сек.');
      setTimeout(function () {
         window.location.href = "/game/?sid=" + data['sid'];
      }, 3000);
      console.log("connection closed (" + e.code + ") reason("+e.reason+")");
   }

   gameSock.onmessage = function(e) {
      console.log("message received: " + e.data);
   }

   SendRequest({action: examine, id: actor.id}, ExamineSuccess);
}

$(function(){
   var sid = getQueryVariable('sid');
   if (!sid) {
      window.location.assign("/");
   }
   $.post(
      "/json",
      {
         uid : sid,
         action: 'getActorID'
      },
      function(data) {
         if (data['result']) {
            actor.id = data.actor_id;
            InitSocket();
         }
      },
      "json"
   );
});