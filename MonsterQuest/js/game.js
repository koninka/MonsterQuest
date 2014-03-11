var sid = getQueryVariable('sid');
var wsuri = "ws://" + getQueryVariable('soсket');
var dict = null;
var gameSock = null;
var tick = null;

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

var actor = new Actor(parseInt(getQueryVariable('id')));

function SendViaWS(hash) {
   hash["sid"] = sid;
   gameSock.send(JSON.stringify(hash))
}

Actor.prototype.move = function(direct) {
   SendViaWS({action: "move", direction: direct, tick: tick});
   console.log(JSON.stringify({action: "move", direction: direct, tick: tick}));
};

Actor.prototype.examineSuccess = function(data) {
   this.pt = new Point(data["x"], data["y"]);
   this.type = data["type"];
   this.login = data["login"];
}

document.onkeydown = function(e) {
   if (!gameSock || gameSock.readyState != 1)
      return;
   e = e || event
   switch(e.keyCode) {
      case 37: // left
         actor.move("west");
         break;
      case 38: // up
         actor.move("north");
         break;
      case 39: // right
         actor.move("east");
         break;
      case 40: // down
         actor.move("south");
         break;
   }
};

function GameShutDown(message) {
   alert("Game is going shutdown due to " + message);
   window.location.assign("/");
}

function InitSocket() {
   gameSock = new WebSocket(wsuri);

   gameSock.onopen = function() {
      console.log("connected to " + wsuri);
      InitGame();
   }

   gameSock.onclose = function(e) {
      alert('Выход через 3 сек.');
      setTimeout(function () {
         window.location.href = "/game/?sid=" + data['sid'];
      }, 3000);
      console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
   }

   gameSock.onmessage = function(e) {
      var data = JSON.parse(e.data);
      if (!data["tick"])
         console.log(e.data);
      var result = data["result"];
      var action = data["action"];
      if (data["tick"]) {
         tick = data["tick"];
      } else if (result == "badSid") {
         GameShutDown("Bad user's security ID");
      } else if (result == "badId") {
         GameShutDown("Bad ID");
      } else {
         switch (action) {
            case "examine":
               actor.examineSuccess(data);
               break
            case "getDictionary":
               dict = data;
               break;
         }
      }
      
   }
}

function InitGame() {
   SendViaWS({action: "examine", id: actor.id});
   SendViaWS({action: "getDictionary"});
}

$(function(){
   if (!sid) {
      GameShutDown();
      return;
   }
   InitSocket();
});