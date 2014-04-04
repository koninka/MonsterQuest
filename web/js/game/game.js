define(['jquery', 'utils/utils', 'player', 'scene', 'graphic', 'options'], function(JQuery, utils, Player, Scene, Graphic, OPTIONS) {

   function Game(sid, wsuri) {
      this.sid      = sid;
      this.sock     = null;
      this.tick     = null;
      this.wsuri    = wsuri;
      this.player   = new Player(parseInt(utils.getQueryVariable('id')));
      this.scene    = new Scene(this.player);
      this.dirsDown  = {};
      //this.examine  = $('<div/>').draggable().hide();
   }

   Game.prototype.setDictionary = function(dict) {
      this.scene.setDictionary(dict);
   };

   Game.prototype.setMap = function(map) {
      this.scene.setMap(map, this.player.pt);
   };

   Game.prototype.setActors = function(actors) {
      this.scene.setActors(actors);
   };

   Game.prototype.movePlayer = function(direct) {
      this.sendViaWS({action: "move", direction: direct, tick: this.tick});
   }

   Game.prototype.defineRadiusFromMap = function(){
      this.scene.defineRadiusFromMap();
   }

   Game.prototype.checkKeys = function(){
      
      if(this.dirsDown['west']) this.movePlayer('west');
      if(this.dirsDown['north']) this.movePlayer('north');
      if(this.dirsDown['east']) this.movePlayer('east');
      if(this.dirsDown['south']) this.movePlayer('south');
   }

   Game.prototype.initGraphic = function() {
      this.graphic = new Graphic(this.scene, this);
   }

   Game.prototype.sendViaWS = function(hash) {
      hash["sid"] = this.sid;
      this.sock.send(JSON.stringify(hash));
     //console.log("request " + JSON.stringify(hash));
   }

   Game.prototype.setPlayerCoords = function(x, y) {
      this.player.pt.x = x;
      this.player.pt.y = y;
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
         th.sendViaWS({action: "examine", id: th.player.id});
         th.sendViaWS({action: "getDictionary"});
         //th.sendViaWS({action: "getOptions"});
         th.sendViaWS({action: "look"});
         th.initGraphic();
         
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
            th.sendViaWS({action: "look"});
         } else if (result == "badSid") {
            utils.gameShutDown("Bad user's security ID");
         } else if (result == "badId") {
            utils.gameShutDown("Bad ID");
         } else {
            switch (data["action"]) {
               case "examine":
                  if(!th.player.pt){
                     th.player.examineSuccess(data);
                     //setInterval(function() {
                     //   th.sendViaWS({action: "look"});
                     //}, 1);
                  } else {
                     this.ShowData(data);
                  }
                  break
               case "getOptions":
                  th.setOptions(data['options']);
               case "getDictionary":
                  th.setDictionary(data);
                  break;
               case "look":
                  th.setPlayerCoords(data.x, data.y);
                  th.setMap(data['map'], th.player.pt);
                  th.setActors(data['actors']);
                  th.defineRadiusFromMap();
                  if (th.firstLook) {
                     th.firstLook = false;
                  }
                  break;
            }
         }
      };

      KeyboardJS.on('up, w', function() {
         game.dirsDown['north'] = true;
      }, function(){
         game.dirsDown['north'] = false;
      })

      KeyboardJS.on('right, d', function() {
         game.dirsDown['east'] = true; 
      }, function(){
         game.dirsDown['east'] = false; 
      })

      KeyboardJS.on('down, s', function() {
         game.dirsDown['south'] = true;
      }, function(){
         game.dirsDown['south'] = false; 
      })

      KeyboardJS.on('left, a', function() {
         game.dirsDown['west'] = true;
      }, function(){
         game.dirsDown['west'] = false; 
      })

      KeyboardJS.on('ctrl > enter', function() {
         var e = $('#view').get(0);
         if(e.webkitRequestFullScreen)
            e.webkitRequestFullScreen();
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