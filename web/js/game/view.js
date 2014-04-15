define(['options', 'actor', 'monster', 'global'], function(OPTIONS, Actor, Monster, GLOBAL) {
   var TILE_SIZE = 32;
   var graphic = null;

   function Background(){
      
      this._data = [
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.']
      ]   // map from look
      this.dictionary = {'.':'grass', '#':'wall'};
      this.map = []
   }

   Background.prototype.SetMap = function(map, pt){
      var TS = OPTIONS.TILE_SIZE;
      var off_x = OPTIONS.screenColumnCount / 2;
      var off_y = OPTIONS.screenRowCount    / 2;
      var y = (-pt.y % 1 - off_y) * TS + TS / 2;
      for(var i = 0; i < map.length; ++i){
         var x = (-pt.x % 1 - off_x) * TS + TS / 2;
         for(var j = 0; j < map[i].length; ++j){
            if(this._data[i][j] != map[i][j]){
               this.map[i][j].setTexture(graphic.Texture(this.dictionary[map[i][j]]));
            }
            this.map[i][j].position.x = x;
            this.map[i][j].position.y = y;
            graphic.Center(this.map[i][j]);
            x += TS;
         }
         y += TS;
      }
      this._data = map;
   }

   Background.prototype.DefineMap = function(map){
      this.map = [];
      for(var i = 0; i < map.length; ++i){
         this.map.push([])
         for(var j = 0; j < map[i].length; ++j){
            var tile = graphic.Draw(this.dictionary[map[i][j]], 0, 0);
            tile.anchor.x = 0.5;
            tile.anchor.y = 0.5;
            this.map[i].push(tile);
         }
      }
      this._data = map;
   }

   function View(player){
      this.player = player;
      this.actors = {};
      this.background = new Background();
      this._examine = null;
      this.__defineSetter__("examine", function(e){
         if(this._examine)
            graphic.Remove(this._examine)
         var txt = '';
         delete e.action;
         delete e.result;
         for(var i in e)
            txt += i + ' : ' + e[i] + "\n";
         this._examine = graphic.Text( 
            txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            0, 
            OPTIONS.TILE_SIZE + 7
         )
         this._examine = graphic.DrawObj(this._examine);
         this._examine.position.x = 20;
         this._examine.position.y = 20;
      })
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

   View.prototype.Draw = function(graphic, game){
      graphic.Clear();
      this.background.Draw(graphic, this.player.pt);
      this.DrawActors(graphic, game);
      this.player.Draw(graphic);
      this.DrawImaginaryBounds(graphic);
      this.DrawExamine(graphic);
   }

   View.prototype.DrawImaginaryBounds = function(graphic){
      var off_x = (OPTIONS.screenColumnCount) / 2 * OPTIONS.TILE_SIZE;
      var off_y = (OPTIONS.screenRowCount   ) / 2 * OPTIONS.TILE_SIZE;
      var c = { x: graphic.width / 2, y : graphic.height / 2 };
      var g = new PIXI.Graphics(0, 0);
      g.beginFill(0);
      g.drawRect(0, 0, c.x - off_x, graphic.height);
      g.drawRect(0, 0, graphic.width,  c.y - off_y);
      g.drawRect(0, graphic.height - c.y + off_y - OPTIONS.TILE_SIZE, graphic.width, c.y - off_y);
      g.drawRect(graphic.width - c.x + off_x - OPTIONS.TILE_SIZE, 0, c.x - off_x, graphic.height);
      graphic.stage.addChild(g);
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