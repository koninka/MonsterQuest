define(['actor', 'game', 'options', 'global'], function(Actor, game, OPTIONS, GLOBAL){

   function Monster(id, x, y, type, player){
      Actor.call(this, id, x, y, type, true, player);
   }

   Monster.prototype = Object.create(Actor.prototype);
   Monster.prototype.constructor = Monster;

   Monster.prototype.InitAnimation = function(init, player){
      if(!init) return;
      this.InitSprite(player);
   }

   Monster.prototype.InitBody = function(){
      var legs = new PIXI.MovieClip(GLOBAL.graphic.textures[this.type].legs);
      legs.position.x = legs.position.y = OPTIONS.TILE_SIZE / 2;
      legs.anchor.x = 0.5;
      legs.anchor.y = 0.5;
      legs.rotation = this.dir;
      legs.animationSpeed = 0.2;
      this.container.addChild(legs);

      var corpse = new PIXI.Sprite(GLOBAL.graphic.textures[this.type].corpse)
      corpse.position.x = corpse.position.y = OPTIONS.TILE_SIZE / 2;
      corpse.anchor.x = 0;
      corpse.anchor.y = 0.5;
      var angle = this.dir;
      if(this.angle)
         angle = this.angle;
      corpse.rotation = angle;
      this.container.addChild(corpse);

      this.container.body = {legs: legs, corpse: corpse};
   }

   Monster.prototype.Rotate = function(){
      this.container.body.legs.rotation = this.dir;
      var angle = this.dir;
      if(this.angle)
         angle = this.angle;
      this.container.body.corpse.rotation = angle;
   }

   Monster.prototype.StartWalkAnim = function(){
      this.container.body.legs.play();
   }

   Monster.prototype.StopWalkAnim = function(){
      this.container.body.legs.stop();
   }

   Monster.prototype.Move = function(player){
      this.StartWalkAnim();
      Actor.prototype.Move.call(this, player);
   }

   Monster.prototype.Destroy = function(){
      Actor.prototype.Destroy.call(this);
      this.walk_anim = undefined;
   }

   return Monster;
})