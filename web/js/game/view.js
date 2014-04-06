define(['options', 'actor', 'monster'], function(OPTIONS, Actor, Monster) {
   var TILE_SIZE = 32;

   function Background(){
      this.map = [
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.']
      ]   // map from look
      this.dictionary = {'.':'grass', '#':'wall'};
   }


   Background.prototype.Draw = function(graphic, pt){
      off_x = OPTIONS.screenColumnCount / 2;
      off_y = OPTIONS.screenRowCount    / 2;

      if (pt == null) return "WTF";

      y = (-pt.y % 1 - off_y) * TILE_SIZE + TILE_SIZE / 2;
      for(var i = 0; i < this.map.length; ++i){
         x = (-pt.x % 1 - off_x) * TILE_SIZE + TILE_SIZE / 2;
         for(var j = 0; j < this.map[i].length; ++j){
            var tile = graphic.Draw(this.dictionary[this.map[i][j]], x, y);
            tile.anchor.x = 0.5;
            tile.anchor.y = 0.5;
            x += TILE_SIZE;
         }
         y += OPTIONS.TILE_SIZE;
      }
   }

   function View(player){
      this.player = player;
      this.actors = {};
      this.background = new Background();
      this.examine = null;
   }

   View.prototype.setActors = function(players){
      var actors_on_scene = [];
      for(var i = 0; i < players.length; ++i){
         var id = players[i].id;
         var x = players[i].x;
         var y = players[i].y;
         if(this.actors[id]){
            var pt = this.actors[id].pt;
            if(pt.x < x){
               if(this.actors[id].dir == 0)
                  this.actors[id].walk_anim++;
               else
                  this.actors[id].walk_anim = 0;
               this.actors[id].dir = 0;
            } else if(pt.x > x){
               if(this.actors[id].dir == Math.PI)
                  this.actors[id].walk_anim++;
               else
                  this.actors[id].walk_anim = 0;
               this.actors[id].dir = Math.PI;
            }
            if(pt.y < y){
               if(this.actors[id].dir == Math.PI / 2)
                  this.actors[id].walk_anim++;
               else
                  this.actors[id].walk_anim = 0;
               this.actors[id].dir = Math.PI / 2;
            } else if(pt.y > y){
               if(this.actors[id].dir == -Math.PI / 2)
                  this.actors[id].walk_anim++;
               else
                  this.actors[id].walk_anim = 0;
               this.actors[id].dir = -Math.PI / 2;
            }
            this.actors[id].pt.x = x;
            this.actors[id].pt.y = y;
         } else {
            if(players[i].type == 'mob')
               this.actors[id] = new Monster(id, x, y, 'zombie');
            else
               this.actors[id] = new Actor(id, x, y, players[i].type);
         }
         actors_on_scene[id] = true;
      }
      for(var i in this.actors)
         if(!actors_on_scene[i])
            delete this.actors[i];
   }

   View.prototype.setMap = function(map, player_pos){
      this.background.map = map;
      //this.fixMap(player_pos);
   }

   View.prototype.fixMap = function(player_pos){
      var map = this.background.map;
      var worldbound;
      if(map.length < OPTIONS.screenRowCount){
         var push = player_pos.y < OPTIONS.screenRowCount ? "unshift" : "push";
         while(map.length < OPTIONS.screenRowCount){
            var row = []
            while(row.length < OPTIONS.screenColumnCount)
               row.push('space');
            map[push](row);   
         }
      }
      if(map[Math.floor(map.length / 2)].length < OPTIONS.screenColumnCount){
         var push = player_pos.x < OPTIONS.screenColumnCount ? "unshift" : "push";
         for(var i = 0; i < map.length; ++i)
            while(map[i].length < OPTIONS.screenColumnCount)
               map[i][push]('space');
      }
   }

   View.prototype.setDictionary = function(dict){
      dict['space'] = 'space';
      this.background.dictionary = dict;
   }

   View.prototype.DrawActors = function(graphic, game){
      for (var i in this.actors) {
         this.actors[i].Draw(graphic, game, this.player)
      }   
   }

   View.prototype.DrawExamine = function(graphic){
      if(this.examine){
         var box = new PIXI.DisplayObjectContainer();
         var txt = '';
         delete this.examine.action;
         for(var i in this.examine)
            txt += i + ' : ' + this.examine[i] + "\n";
         var text = graphic.Text( 
            txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            0, 
            OPTIONS.TILE_SIZE + 7
         )
         text = graphic.DrawObj(text);
         text.position.x = 20;
         text.position.y = 20;
      }
   }
   View.prototype.Draw = function(graphic){
      graphic.Clear();
      this.background.Draw(graphic, this.player.pt);
      this.DrawActors(graphic);
      this.player.Draw(graphic);
      this.DrawImaginaryBounds(graphic);
      this.DrawExamine(graphic);
   }

   View.prototype.DrawImaginaryBounds = function(graphic){
      var off_x = (OPTIONS.screenColumnCount) / 2 * OPTIONS.TILE_SIZE;
      var off_y = (OPTIONS.screenRowCount   ) / 2 * OPTIONS.TILE_SIZE;
      var w = (OPTIONS.screenColumnCount - 1) * OPTIONS.TILE_SIZE
      var h = (OPTIONS.screenRowCount - 1) * OPTIONS.TILE_SIZE
      var c = { x: graphic.width / 2, y : graphic.height / 2 };
      var g = new PIXI.Graphics(0, 0);
      g.beginFill(0);
      g.drawRect(c.x - off_x, c.y - off_y, w, h);
      graphic.stage.mask = g;
   }

   View.prototype.Clear = function(graphic){
      graphic.Clear();
   }

   View.prototype.defineRadiusFromMap = function(){
      var map = this.background.map;
      OPTIONS.screenRowCount = map.length;
      if(map[0] == undefined)
         alert("Смените сервак он харкается фигней")
      OPTIONS.screenColumnCount = map[0].length;
   }

   return View;
})