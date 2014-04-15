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


   Player.prototype.Rotate = function() {
      var angle = GLOBAL.graphic.angleToPointer(this.pt);
      this.container.body.rotation = angle;
   }

   Player.prototype.examineSuccess = function(data) {
      this.pt.x = data["x"];
      this.pt.y = data["y"];
      this.type = data["type"];
      this.login = data["login"];
   }

   return Player;
});