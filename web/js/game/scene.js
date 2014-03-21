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
            graphic.DrawObj(null, x, y, this.dictionary[this.map[i][j]])
            x += TILE_SIZE;
         }
         y += consts.TILE_SIZE;
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

   Scene.prototype.setMap = function(map){

      this.background.map = map;
   }

   Scene.prototype.setDictionary = function(dict){
      this.background.dictionary = dict;
   }

   Scene.prototype.Draw = function(graphic)
   {
      //this.Clear(graphic);
      //this.players_sprite = []
      graphic.Clear();
      this.background.Draw(graphic, this.player.pt);
      for (var i = 0; i < this.players.length; ++i) {
         console.log("draw");
         var playerGroup = graphic.game.add.group();
         var tile = playerGroup.create(0, 0, 'player');
         var login = this.players[i].login || ("actor_" + this.players[i].id);
         var txt = new graphic.Text(
            graphic.game,
            0,
            consts.TILE_SIZE + 7,
            login,
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'}
         );
         txt.x = (tile.width - txt.width) / 2 + 2;
         playerGroup.add(txt);
         graphic.drawGroup(
            playerGroup,
            (this.players[i].x - this.player.pt.x) * consts.TILE_SIZE,
            (this.players[i].y - this.player.pt.y) * consts.TILE_SIZE
         );
      }
      this.player.Draw(graphic);
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