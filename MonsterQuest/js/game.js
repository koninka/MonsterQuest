var dict = null;
var wsuri = "ws://localhost:8080/websocket";
var gameSock = null


function Point(x, y) {
   this.x = x;
   this.y = y;
}

function Actor(id) {
   this.id    = id;
   this.pt    = null;
   this.type  = null;
   this.login = null;
}

var actor = new Actor()

Actor.prototype.move = function(direct) {
   gameSock.send(JSON.stringify({action: move, direction: direct, tick: 1}));
};

document.onkeydown = function(e) {
   e = e || event
   switch(e.keyCode) {
      case 37: // left
         actor.move(west);
         break;
      case 38: // up
         actor.move(north);
         break;
      case 39: // right
         actor.move(east);
         break;
      case 40: // down
         actor.move(south);
         break;
   }
}


var actor = {}

function ExamineSuccess(data) {
   console.log("examine success to " + data.result);
   // if (data.result != 'ok') {
   //    window.location.assign("/")
   // }

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
      switch (e.data.action) {
         case examine:
            ExamineSuccess(e.data);
            break
         case getDictionary:
            dict = e.data.dictionary;
            break;
         // case
      }
   }
}

function InitGame() {
   gameSock.send(JSON.stringify({action: examine, id: actor.id}));
   gameSock.send(JSON.stringify({action: getDictionary}));
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
            InitGame();
         }
      },
      "json"
   );
});