define(['consts'], function(consts) {
   function Background(){
      this.map = [
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.'],
         ['.', '.','.','.','.']
      ]   // map from look
      this.cells = [] // sprites objects
      this.dictionary = {'.':'grass', '#':'wall'};
   }

   Background.prototype.Draw = function(graphic){
      //this.cells = [];
      this.cells = [];
      for(var i = 0; i < this.map.length; ++i){
         this.cells.push([]);
         for(var j = 0; j < this.map[i].length; ++j){
            x = j * consts.TILE_SIZE;
            y = i * consts.TILE_SIZE;
            this.cells[i].push(graphic.DrawObj(null, x, y, this.dictionary[this.map[i][j]]))
         }
      }
   }

   function Scene(player)
   {
      this.player = player;
      this.players = [];
      this.players_sprite = [] //<- это надо куда то запихать возможно потипу background'a
      this.background = new Background();
   }

   Scene.prototype.setActors = function(players){
      for(var i = 0; i < this.players_sprite; ++i){
         this.players_sprite[i].destroy();
      }
      this.players = players;
   }

   Scene.prototype.setMap = function(map){
      this.background.map = map;
   }

   Scene.prototype.setDictionary = function(dict){
      this.background.dictionary = dict;
   }

   Scene.prototype.Draw = function(graphic)
   {
      this.background.Draw(graphic);
      for (var i = 0; i < this.players.length; ++i) {
         console.log("draw");
         var x = this.players[i].x;
         var y = this.players[i].y;
         var playerGroup = graphic.game.add.group();
         playerGroup.x = x + 40;
         playerGroup.y = y;
         var tile = playerGroup.create(0, 0, 'player');
         var login = this.players[i].login || ("actor_" + this.players[i].id);
         var txt = new Phaser.Text(
            graphic.game,
            0,
            consts.TILE_SIZE + 7,
            login,
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'}
         );
         txt.x = (tile.width - txt.width) / 2 + 2;
         playerGroup.add(txt);
      }
      this.player.Draw(graphic);
   }

   return Scene;
})