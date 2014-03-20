function Point(x, y) {
   this.x = x;
   this.y = y;
}

function Player(id) {
   this.id     = id;
   this.pt     = null;
   this.type   = null;
   this.login  = null;
   this.tile   = null;
}

Player.prototype.move = function(direct) {
   SendViaWS({action: "move", direction: direct, tick: game.tick});
  // console.log(JSON.stringify({action: "move", direction: direct, tick: game.tick}));
};

Player.prototype.Draw = function(graphic) {
   this.tile = graphic.DrawObj(this.tile, this.pt.x, this.pt.y, 'player')
}

Player.prototype.examineSuccess = function(data) {
   this.pt = new Point(data["x"], data["y"]);
   this.type = data["type"];
   this.login = data["login"];
}

function Game(sid, wsuri) {
   this.sid      = sid;
   this.sock     = null;
   this.tick     = null;
   this.wsuri    = "ws://" + wsuri;
   this.player   = new Player(parseInt(getQueryVariable('id')));
   this.scene    = new Scene(this.player);
}

Game.prototype.setDictionary = function(dict) {
   this.scene.setDictionary(dict);
};

Game.prototype.setMap = function(map) {
   this.scene.setMap(map);
};

Game.prototype.setActors = function(actors) {
   this.scene.setActors(actors);
};

Game.prototype.initGraphic = function() {
   this.graphic = new Graphic(this.scene);
};

Game.prototype.Start = function() {
   //this.scene.Draw();
   //this.player   = new Player(parseInt(getQueryVariable('id')));
   //this.scene    = new Scene(this.player);
   //this.renderer = new Renderer(this.scene);
   this.firstLook = true;
}

Game.prototype.lookOut = function() {
   SendViaWS({action: "look"});
};

function SendViaWS(hash) {
   hash["sid"] = game.sid;
   game.sock.send(JSON.stringify(hash));
  //console.log("request " + JSON.stringify(hash));
}

document.onkeydown = function(e) {
   var actor = game.player;
   if (!game.sock || game.sock.readyState != 1)
      return;
   e = e || event
   switch(e.keyCode) {
      case 37:
         game.player.move("west");
         break;
      case 38:
         game.player.move("north");
         break;
      case 39:
         game.player.move("east");
         break;
      case 40:
         game.player.move("south");
         break;
   }
};

var game  = new Game(getQueryVariable('sid'), getQueryVariable('soсket'));

$(function(){
   if (!game.sid) {
      GameShutDown();
      return;
   }
   game.sock = new WebSocket(game.wsuri);

   game.sock.onopen = function() {
     // console.log("connected to " + game.wsuri);
      SendViaWS({action: "examine", id: game.player.id});
      SendViaWS({action: "getDictionary"});
      SendViaWS({action: "look"});
   };

   game.sock.onclose = function(e) {
      alert('Logout after 3 seconds');
      setTimeout(function () {
         window.location.href = "/game/?sid=" + data['sid'];
      }, 3000);
      console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
   };

   game.sock.onmessage = function(e) {
      var data = JSON.parse(e.data);
      var result = data["result"];
      if (data["tick"]) {
         game.tick = data["tick"];
      } else if (result == "badSid") {
         GameShutDown("Bad user's security ID");
      } else if (result == "badId") {
         GameShutDown("Bad ID");
      } else {
         switch (data["action"]) {
            case "examine":
               game.player.examineSuccess(data);
               setInterval(game.lookOut, 300);
               break
            case "getDictionary":
               game.setDictionary(data);
               break;
            case "look":
               game.setMap(data['map']);
               game.setActors(data['actors']);
               if (game.firstLook) {
                  game.firstLook = false;
                  requestAnimationFrame(Render);
               }
               break;
         }
      }
   };
   game.initGraphic();
});

/*function renderScene() {
   game.graphic.refreshView();
   game.graphic.renderer.render(game.graphic.stage);
   requestAnimationFrame(renderScene);
}*/

