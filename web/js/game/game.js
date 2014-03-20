define(['utils/utils', 'player', 'scene', 'graphic'], function(utils, Player, Scene, Graphic) {
   function Game(sid, wsuri) {
      this.sid      = sid;
      this.sock     = null;
      this.tick     = null;
      this.wsuri    = "ws://" + wsuri;
      this.player   = new Player(parseInt(utils.getQueryVariable('id')));
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

   Game.prototype.movePlayer = function(direct) {
      this.sendViaWS({action: "move", direction: direct, tick: this.tick});
   }

   Game.prototype.initGraphic = function() {
      this.graphic = new Graphic(this.scene);
   };

   Game.prototype.sendViaWS = function(hash) {
      hash["sid"] = this.sid;
      this.sock.send(JSON.stringify(hash));
     //console.log("request " + JSON.stringify(hash));
   }

   Game.prototype.Start = function() {
      if (!this.sid) {
         utils.gameShutDown();
         return;
      }

      this.sock = new WebSocket(this.wsuri);

      var th = this
      this.sock.onopen = function() {
        // console.log("connected to " + game.wsuri);
         th.sendViaWS({action: "examine", id: th.player.id});
         th.sendViaWS({action: "getDictionary"});
         th.sendViaWS({action: "look"});
      };

      this.sock.onclose = function(e) {
         alert('Logout after 3 seconds');
         setTimeout(function () {
            window.location.href = "/game/?sid=" + data['sid'];
         }, 3000);
         console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
      };

      this.sock.onmessage = function(e) {
         var data = JSON.parse(e.data);
         var result = data["result"];
         if (data["tick"]) {
            th.tick = data["tick"];
         } else if (result == "badSid") {
            utils.gameShutDown("Bad user's security ID");
         } else if (result == "badId") {
            utils.gameShutDown("Bad ID");
         } else {
            switch (data["action"]) {
               case "examine":
                  th.player.examineSuccess(data);
                  setInterval(function() {
                     th.sendViaWS({action: "look"});
                  }, 300);
                  break
               case "getDictionary":
                  th.setDictionary(data);
                  break;
               case "look":
                  th.setMap(data['map']);
                  th.setActors(data['actors']);
                  if (th.firstLook) {
                     th.firstLook = false;
                     // requestAnimationFrame(Render);
                  }
                  break;
            }
         }
      };
      this.initGraphic();
      this.firstLook = true;
   }

   var game  = new Game(utils.getQueryVariable('sid'), utils.getQueryVariable('soсket'));

   document.onkeydown = function(e) {
      var actor = game.player;
      if (!game.sock || game.sock.readyState != 1)
         return;
      e = e || event
      switch(e.keyCode) {
         case 37:
            game.movePlayer("west");
            break;
         case 38:
            game.movePlayer("north");
            break;
         case 39:
            game.movePlayer("east");
            break;
         case 40:
            game.movePlayer("south");
            break;
      }
   };

   return game;
});