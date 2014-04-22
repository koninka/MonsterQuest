define(['options', 'global', 'actor_w_container'] ,function(OPTIONS, GLOBAL, ActorWC){

   function ActorSimpleTopDown(id, x, y, type, health, name, initAnimation, player){
      ActorWC.call(this, id, x, y, type, health, name, initAnimation, player);
   }

   ActorSimpleTopDown.prototype = Object.create(ActorWC.prototype);
   ActorSimpleTopDown.prototype.constructor = ActorSimpleTopDown;

   ActorSimpleTopDown.prototype.Init = function(player){
      ActorWC.prototype.Init.call(this, player);
      this.InitBody();
   }

   ActorSimpleTopDown.prototype.InitBody = function(){
      var tile = GLOBAL.graphic.Sprite(this.type);
      tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
      tile.rotation = this.dir;
      this.container.addChild(tile);
      this.container.body = tile;
   }

   ActorSimpleTopDown.prototype.DirToAngle = function(dir){
      switch(dir){
         case "top"  : return - Math.PI / 2;
         case "down" : return Math.PI / 2;
         case "left" : return Math.PI;
         case "right": return 0;
      }
   }

   ActorSimpleTopDown.prototype.Rotate = function(){
      this.container.body.rotation = this.DirToAngle(this.dir);
   }

   ActorSimpleTopDown.prototype.Move = function(pos, player){
      ActorWC.prototype.Move.call(this, pos, player);
      this.Rotate();
   }

   return ActorSimpleTopDown;
})