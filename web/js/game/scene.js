define(['consts'], function(CONSTS) {
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
      this.cells = [] // sprites objects
      this.dictionary = {'.':'grass', '#':'wall'};
   }

   Background.prototype.Draw = function(graphic, pt){
      off_x = CONSTS.screenColumnCount / 2;
      off_y = CONSTS.screenRowCount    / 2;

      this.cells = [];
      y = (-pt.y % 1 - off_y) * TILE_SIZE;
      for(var i = 0; i < this.map.length; ++i){
         this.cells.push([]);
         x = (-pt.x % 1- off_x) * TILE_SIZE;
         for(var j = 0; j < this.map[i].length; ++j){
            this.cells[i].push(graphic.DrawObj(null, x, y, this.dictionary[this.map[i][j]]))
            x += TILE_SIZE;
         }
         y += TILE_SIZE;
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
      this.players_sprite = []
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
      //this.Clear();
      //this.players_sprite = []
      this.background.Draw(graphic, this.player.pt);
      for (var i = 0; i < this.players.length; ++i) {
         this.players_sprite.push(graphic.DrawObj(
            null, 
            (this.players[i].x - this.player.pt.x) * TILE_SIZE, 
            (this.players[i].y - this.player.pt.y) * TILE_SIZE, 
            'player'
         ));
         //console.log(this.players_sprite[i]);
         //player.Draw();
      }

      this.player.Draw(graphic);
      //this.render();
       //graphic.renderer.render(graphic.stage);
       //requestAnimationFrame(this.Draw);
   }

   return Scene;
})