define(['options', 'global'], function(OPTIONS, GLOBAL) {
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
      this.bounds = null;
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
      var last = null;
      for(var i = 0; i < players.length; ++i){
         var id = players[i].id;
         var x = players[i].x;
         var y = players[i].y;
         if(this.actors[id]){
            this.actors[id].Move({x: x, y: y}, this.player);
         } else {
            var t = this.actorType(players[i].symbol);
            var a = this.dictionary[players[i].symbol];
            this.actors[id] = new t(id, x, y, a, true, this.player)
            last = this.actors[id];
         }
         actors_on_scene[id] = true;
      }
      for(var i in this.actors)
         if(!actors_on_scene[i]){
            this.actors[i].Destroy();
            delete this.actors[i];
         }
      if(last){
         if(this._examine){
            graphic.stage.swapChildren(graphic.stage.children[graphic.stage.children.length-2], this.bounds);
            graphic.stage.swapChildren(graphic.stage.children[graphic.stage.children.length-1], this._examine);
         } else 
            graphic.stage.swapChildren(this.bounds, last.container);
      }
   }

   View.prototype.setMap = function(map, player_pos){
      this.background.SetMap(map, player_pos)
   }

   View.prototype.actorType = function(symbol){
      var t = GLOBAL.graphic.actorTypes[this.dictionary[symbol]];
      if (!t)
         t = GLOBAL.graphic.actorTypes['player'];
      return t;
   }

   View.prototype.setDictionary = function(dict){
      this.background.dictionary = dict;
      this.dictionary = dict;
   }

   View.prototype.DefineImaginaryBounds = function(){
      var off_x = (OPTIONS.screenColumnCount) / 2 * OPTIONS.TILE_SIZE;
      var off_y = (OPTIONS.screenRowCount   ) / 2 * OPTIONS.TILE_SIZE;
      var c = { x: graphic.width / 2, y : graphic.height / 2 };
      var g = new PIXI.Graphics(0, 0);
      g.beginFill(0);
      g.drawRect(0, 0, c.x - off_x, graphic.height);
      g.drawRect(0, 0, graphic.width,  c.y - off_y);
      g.drawRect(0, graphic.height - c.y + off_y - OPTIONS.TILE_SIZE, graphic.width, c.y - off_y);
      g.drawRect(graphic.width - c.x + off_x - OPTIONS.TILE_SIZE, 0, c.x - off_x, graphic.height);
      this.bounds = g;
      graphic.stage.addChild(this.bounds);
   }

   View.prototype.Clear = function(graphic){
      graphic.Clear();
   }

   View.prototype.defineRadiusFromMap = function(map){
      OPTIONS.screenRowCount = map.length;
      if(map[0] == undefined)
         alert("Смените сервак он харкается фигней")
      OPTIONS.screenColumnCount = map[0].length;
      graphic = GLOBAL.graphic;
      this.background.DefineMap(map);
      this.DefineImaginaryBounds();
   }

   return View;
})