define(['jquery', 'utils/utils', 'player', 'view', 'graphic', 'options', 'global'], 
   function(JQuery, utils, Player, View, Graphic, OPTIONS, GLOBAL) {

   function Game(sid, wsuri) {
      this.sid      = sid;
      this.sock     = null;
      this.tick     = null;
      this.wsuri    = wsuri;
      this.player   = new Player(parseInt(utils.getQueryVariable('id')))
      this.view     = new View(this.player);
      this.dirsDown  = [];
      GLOBAL.game = this;
      //this.examine  = $('<div/>').draggable().hide();
   }

   Game.prototype.setDictionary = function(dict) {
      this.view.setDictionary(dict);
   };

   Game.prototype.setMap = function(map) {
      this.view.setMap(map, this.player.pt);
   };

   Game.prototype.setActors = function(actors) {
      this.view.setActors(actors);
   };

   Game.prototype.movePlayer = function(direct) {
      this.sendViaWS({action: "move", direction: direct, tick: this.tick});
   }

   Game.prototype.defineRadiusFromMap = function(map){
      this.view.defineRadiusFromMap(map);
   }

   Game.prototype.dirDown = function(dir){
      game.dirsDown.push(dir);
   }

   Game.prototype.dirUp = function(dir){
      for(var i = 0; game.dirsDown.length; ++i){
         if(game.dirsDown[i] == dir){
            game.dirsDown.splice(i, 1);
            return;
         }
      }
   }

   Game.prototype.checkKeys = function(){
      if(this.dirsDown[0]) this.movePlayer(this.dirsDown[0]);
   }

   Game.prototype.initGraphic = function() {
      this.graphic = new Graphic(this.view, this);
   }

   Game.prototype.sendViaWS = function(hash) {
      hash["sid"] = this.sid;
      this.sock.send(JSON.stringify(hash));
     //console.log("request " + JSON.stringify(hash));
   }

   Game.prototype.setPlayerCoords = function(x, y) {
      this.player.Move({x: x, y: y}, this.player);
   }

   Game.prototype.setExamineData = function(data){
      this.view.examine = data;
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
         th.firstLook = true;
         th.initGraphic();
         th.sendViaWS({action: "getDictionary"});
         //th.sendViaWS({action: "getOptions"});
         th.sendViaWS({action: "look"});
         th.sendViaWS({action: "examine", id: th.player.id});
         
      };

      this.sock.onclose = function(e) {
         alert('Logout after 3 seconds');
         setTimeout(function () {
            window.location.href = "/";
         }, 3000);
         console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
      };

      this.sock.onmessage = function(e) {
         var data = JSON.parse(e.data);
         var result = data["result"];
         if (data["tick"]) {
            th.tick = data["tick"];
            th.sendViaWS({action: "look"});
         } else if (result == "badSid") {
            utils.gameShutDown("Bad user's security ID");
         } else if (result == "badId") {
            utils.gameShutDown("Bad ID");
         } else {
            switch (data["action"]) {
               case "examine":
                  th.setExamineData(data);
                  break
               case "getOptions":
                  th.setOptions(data['options']);
               case "getDictionary":
                  th.setDictionary(data);
                  break;
               case "look":
                  if (th.firstLook) {
                     th.defineRadiusFromMap(data['map']);
                     th.firstLook = false;
                     th.player.InitAnimation(true, th.player);
                  }
                  th.setPlayerCoords(data.x, data.y);
                  th.setMap(data['map'], th.player.pt);
                  th.setActors(data['actors']);
                  break;
            }
         }
      };

      KeyboardJS.on('up, w', function() {
         game.dirDown('north');
      }, function(){
         game.dirUp('north');
      })

      KeyboardJS.on('right, d', function() {
         game.dirDown('east');
      }, function(){
         game.dirUp('east');
      })

      KeyboardJS.on('down, s', function() {
         game.dirDown('south');
      }, function(){
         game.dirUp('south');
      })


      KeyboardJS.on('left, a', function() {
         game.dirDown('west');
      }, function(){
         game.dirUp('west');
      })

      KeyboardJS.on('ctrl > enter', function() {
         var e = $('#view canvas').get(0);
         if(e.webkitRequestFullscreen)//webkitRequestFullScreen есть разница
            e.webkitRequestFullscreen();
         else if(e.mozRequestFullScreen)
            e.mozRequestFullScreen();
      });

      setInterval(function(){
         th.checkKeys()
      }, 1)


   }

   var game  = new Game(utils.getQueryVariable('sid'), utils.getQueryVariable('soсket'));

   return game;
});