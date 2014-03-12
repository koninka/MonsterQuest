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

Actor.prototype.move = function(direct) {
   SendViaWS({action: "move", direction: direct, tick: game.tick});
   console.log(JSON.stringify({action: "move", direction: direct, tick: game.tick}));
};

Actor.prototype.examineSuccess = function(data) {
   this.pt = new Point(data["x"], data["y"]);
   this.type = data["type"];
   this.login = data["login"];
}

function Game(sid, wsuri, srv, tick) {
   this.sid   = sid;
   this.srv   = srv;
   this.sock  = null;
   this.dict  = null;
   this.tick  = tick;
   this.wsuri = "ws://" + wsuri;
}

var actor = new Actor(parseInt(getQueryVariable('id')));
var game  = new Game(getQueryVariable('sid'), getQueryVariable('soсket'));

function SendViaWS(hash) {
   hash["sid"] = game.sid;
   game.sock.send(JSON.stringify(hash));
   console.log("request " + JSON.stringify(hash));
}

document.onkeydown = function(e) {
   if (!game.sock || game.sock.readyState != 1)
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

$(function(){
   if (!game.sid) {
      GameShutDown();
      return;
   }
   game.sock = new WebSocket(game.wsuri);

   game.sock.onopen = function() {
      console.log("connected to " + game.wsuri);
      SendViaWS({action: "examine", id: actor.id});
      SendViaWS({action: "getDictionary"});
      setTimeout(function () {
         //SendViaWS({action: "look"});
      }, 300);
   }

   game.sock.onclose = function(e) {
      alert('Выход через 3 сек.');
      setTimeout(function () {
         window.location.href = "/game/?sid=" + data['sid'];
      }, 3000);
      console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
   }

   game.sock.onmessage = function(e) {
      var data = JSON.parse(e.data);
      if (!data["tick"])
         console.log("response " + e.data);
      var result = data["result"];
      var action = data["action"];
      if (data["tick"]) {
         game.tick = data["tick"];
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
               graphic.setDictionary(data);
               game.dict = data;
               break;
            case "look":
               graphic.setMap(data['map'])
               graphic.setActors(data['actors'])
               break;
         }
      }
   }
});