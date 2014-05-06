define(['options', 'global', 'actor_angband'] ,function(OPTIONS, GLOBAL, ActorA){

   function ActorSimpleTopDown(id, x, y, type, health, name, initAnimation, player){
      ActorA.call(this, id, x, y, type, health, name, initAnimation, player);
   }

   ActorSimpleTopDown.prototype = Object.create(ActorA.prototype);
   ActorSimpleTopDown.prototype.constructor = ActorSimpleTopDown;

   ActorSimpleTopDown.prototype.InitBody = function(){
      ActorA.prototype.InitBody.call(this);
      this.container.body.rotation = this.dir;
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
      ActorA.prototype.Move.call(this, pos, player);
      this.Rotate();
   }

   return ActorSimpleTopDown;
})