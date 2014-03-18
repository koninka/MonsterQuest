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
   console.log(JSON.stringify({action: "move", direction: direct, tick: game.tick}));
};

Player.prototype.Draw = function(graphic) {
   graphic.DrawObj(this.tile, this.x, this.y, 'player')
   //tile.position.x = this.x;
   //tile.position.y = this.y;
   //graphic.addChild(tile);
}

Player.prototype.examineSuccess = function(data) {
   this.pt = new Point(data["x"], data["y"]);
   this.type = data["type"];
   this.login = data["login"];
}

function Game(sid, wsuri, srv, tick) {
   this.sid      = sid;
   this.srv      = srv;
   this.sock     = null;
   this.tick     = tick;
   this.wsuri    = "ws://" + wsuri;
   this.graphic  = new Graphic();
   this.scene    = new Scene();
   this.player   = new Player(parseInt(getQueryVariable('id')));
   this.renderer = new Renderer(this.scene);
}

Game.prototype.setDictionary = function(dict) {
   this.graphic.setDictionary(dict);
};

Game.prototype.setMap = function(map) {
   this.graphic.setMap(map);
};

Game.prototype.setActors = function(actors) {
   this.graphic.setActors(actors);
};

Game.prototype.initGraphic = function() {
   this.graphic.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
   $("#view").append(this.graphic.renderer.view);
   this.graphic.stage = new PIXI.Stage;
};

Game.prototype.Start = function() {
   this.scene.Draw();
};

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

var game  = new Game(getQueryVariable('sid'), getQueryVariable('soсket'));

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
               this.player.examineSuccess(data);
               break
            case "getDictionary":
               game.setDictionary(data);
               break;
            case "look":
               game.setMap(data['map']);
               game.setActors(data['actors']);
               break;
         }
      }
   };

   game.initGraphic();
   game.Start();
});

/*function renderScene() {
   game.graphic.refreshView();
   game.graphic.renderer.render(game.graphic.stage);
   requestAnimationFrame(renderScene);
}*/

