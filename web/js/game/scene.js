define(['options'], function(OPTIONS) {
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

      y = (-pt.y % 1 - off_y) * TILE_SIZE;
      for(var i = 0; i < this.map.length; ++i){
         x = (-pt.x % 1 - off_x) * TILE_SIZE;
         for(var j = 0; j < this.map[i].length; ++j){
            graphic.Draw(this.dictionary[this.map[i][j]], x, y)
            x += TILE_SIZE;
         }
         y += OPTIONS.TILE_SIZE;
      }
   }

   function Scene(player)
   {
      this.player = player;
      this.players = [];
      this.background = new Background();
   }

   Scene.prototype.setActors = function(players){
      this.players = players;
   }

   Scene.prototype.setMap = function(map, player_pos){
      this.background.map = map;
      this.fixMap(player_pos);
   }

   Scene.prototype.fixMap = function(player_pos){
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

   Scene.prototype.setDictionary = function(dict){
      dict['space'] = 'space';
      this.background.dictionary = dict;
   }

   Scene.prototype.DrawActors = function(graphic){
      for (var i = 0; i < this.players.length; ++i) {
         this.DrawActor(graphic, this.players[i]);
      }   
   }

   Scene.prototype.DrawActor = function(graphic, actor){
      var playerGroup = new PIXI.DisplayObjectContainer();
      var tile = graphic.Sprite('player');
      var login = actor.login || (actor.type + actor.id);
      var txt = graphic.Text( 
         login, 
         {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'},
         0, 
         OPTIONS.TILE_SIZE + 7
      )
      txt.position.x = (tile.width - txt.width) / 2 + 2;
      playerGroup.addChild(tile);
      playerGroup.addChild(txt);
      graphic.DrawObj(
         playerGroup,
         (actor.x - this.player.pt.x) * OPTIONS.TILE_SIZE - tile.texture.width / 2,
         (actor.y - this.player.pt.y) * OPTIONS.TILE_SIZE - tile.texture.height / 2
      );
   }

   Scene.prototype.Draw = function(graphic)
   {
      graphic.Clear();
      this.background.Draw(graphic, this.player.pt);
      this.DrawActors(graphic);
      this.player.Draw(graphic);
      this.DrawImaginaryBounds(graphic);
   }

   Scene.prototype.DrawImaginaryBounds = function(graphic){
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

   Scene.prototype.Clear = function(graphic){
      graphic.Clear();
   }

   Scene.prototype.defineRadiusFromMap = function(){
      var map = this.background.map;
      OPTIONS.screenRowCount = map.length;
      if(map[0] == undefined)
         alert("Смените сервак он харкается фигней")
      OPTIONS.screenColumnCount = map[0].length;
   }

   return Scene;
})