define(['actor'], function(Actor){

   function Player(id) {
      Actor.call(this, id);
      this.type = 'player';
      this.login = null;
   }

   Player.prototype = Object.create(Actor.prototype);
   Player.prototype.constructor = Player;

   Player.prototype.echo = function() {
      alert(this.login);
   }

   Player.prototype.Draw = function(graphic) {
      var tile = graphic.Draw('player', 0, 0);
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
   }

   Player.prototype.examineSuccess = function(data) {
      this.pt.x = data["x"];
      this.pt.y = data["y"];
      this.type = data["type"];
      this.login = data["login"];
   }

   return Player;
});