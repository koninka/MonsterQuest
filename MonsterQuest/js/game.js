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
   this.tick     = tick;
   this.wsuri    = "ws://" + wsuri;
   this.RADIUS_X = 3;
   this.RADIUS_Y = 5;
   this.BG_SIZE  = 120;
   this.renderer = null;
   this.graphic  = new Graphic();

   this.setDictionary = function(dict) {
      this.graphic.setDictionary(dict);
   }

   this.setMap = function(map) {
      this.graphic.setMap(map);
   }

   this.setActors = function(actors) {
      this.graphic.setActors(actors);
   }

   this.initGraphic = function() {
      this.graphic.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
      $("#view").append(this.graphic.renderer.view);
      // this.graphic.map = testTerrain;
      this.graphic.stage = new PIXI.Stage;
      this.graphic.Init();
   }
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
               game.setDictionary(data);
               break;
            case "look":
               game.setMap(data['map']);
               game.setActors(data['actors']);
               requestAnimFrame(renderScene);
               break;
         }
      }
   }
   game.initGraphic();
});

function renderScene() {
   game.graphic.refreshView();
   game.graphic.renderer.render(game.graphic.stage);
   requestAnimationFrame(renderScene);
}