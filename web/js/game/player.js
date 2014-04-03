define(function(){
   function Point(x, y) {
      this.x = x;
      this.y = y;
   }

   function Player(id) {
      this.id         = id;
      this.pt         = null;
      this.type       = null;
      this.login      = null;
   }

   Player.prototype.echo = function() {
      alert(this.login);
   }

   Player.prototype.Draw = function(graphic) {
      var tile = graphic.Draw('player', 0, 0);
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
   }

   Player.prototype.examineSuccess = function(data) {
      this.pt = new Point(data["x"], data["y"]);
      this.type = data["type"];
      this.login = data["login"];
   }

   return Player;
});