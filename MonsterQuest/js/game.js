function Point(x, y) {
   this.x = x;
   this.y = y;
}

function Actor(id) {
   this.id     = id;
   this.pt     = null;
   this.type   = null;
   this.login  = null;
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
   this.sid      = sid;
   this.srv      = srv;
   this.sock     = null;
   this.dict     = null;
   this.tick     = tick;
   this.stage    = null;
   this.wsuri    = "ws://" + wsuri;
   this.RADIUS_X = 3;
   this.RADIUS_Y = 5;
   this.BG_SIZE  = 120;
   this.renderer = null;
   this.textures = null;
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
         SendViaWS({action: "look"});
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
               for (var i in game.dictionary) {
                  game.textures[i] = PIXI.Texture.fromImage("/img/" + game.dictionary[i] + ".jpg");
               }
               break;
            case "look":
               game.map = data.map;
               game.actors = data.actors;
               break;
         }
      }
   }

   game.renderer = PIXI.autoDetectRenderer(
      2 * game.BG_SIZE * game.RADIUS_Y,
      2 * game.BG_SIZE * game.RADIUS_X,
      document.getElementById("game-canvas")
   );
   // var farTexture = PIXI.Texture.fromImage("/img/grass.jpg");
   // game.far = new PIXI.TilingSprite(farTexture, 512, 256);
   // game.far.position.x = 230;
   // game.far.position.y = 0;
   // game.far.tilePosition.x = 0;
   // game.far.tilePosition.y = 0
   // game.stage.addChild(game.far)
   // game.renderer.render(game.stage);
   requestAnimFrame(update);
});

function update() {
   game = new PIXI.Stage(0x66BB99)

   game.renderer.render(game.stage);

   requestAnimFrame(update);
}
