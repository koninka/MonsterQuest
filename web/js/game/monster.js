define(['actor', 'game', 'options', 'global'], function(Actor, game, OPTIONS, GLOBAL){

   function Monster(id, x, y, type, player){
      Actor.call(this, id, x, y, type, true, player);
   }

   Monster.prototype = Object.create(Actor.prototype);
   Monster.prototype.constructor = Monster;

   Monster.prototype.InitAnimation = function(init, player){
      if(!init) return;
      this.InitSprite(player);
      this.walk_anim = {}
      this.walk_anim.counter = 0;
      this.walk_anim.max = 8;
      this.walk_anim.speed = 1;
      this.walk_anim.start = true;
      this.walk_anim.pos = this.pt;
      this.walk_anim.tick = GLOBAL.game.tick;
   }

   Monster.prototype.InitBody = function(){
      var legs = new PIXI.Sprite(GLOBAL.graphic.textures[this.type].legs[0]);
      legs.position.x = legs.position.y = OPTIONS.TILE_SIZE / 2;
      legs.anchor.x = 0.5;
      legs.anchor.y = 0.5;
      legs.rotation = this.dir;
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
      this.walk_anim.start = true;
      this.walk_anim.pos = this.pt;
      this.walk_anim.tick = GLOBAL.game.tick;
      I = this;
      //setTimeout(function () {

         I.WalkAnim(I.walk_anim.speed);
      //}, this.walk_anim.speed);
   }

   Monster.prototype.WalkAnim = function(speed){
      I = this;
      if(!this.walk_anim.start) return;
      this.container.body.legs.setTexture(GLOBAL.graphic.Texture(this.type).legs[this.walk_anim.counter]);
      this.walk_anim.counter++;
      if(this.walk_anim.counter >= this.walk_anim.max)
         this.walk_anim.counter = 0;
      //if(this.walk_anim.pos.x == this.pt.x && this.walk_anim.pos.y == this.pt.y && GLOBAL.game.tick - this.walk_anim.tick > speed)
      //   this.StopWalkAnim();
      this.walk_anim.pos = this.pt;
      this.walk_anim.tick = GLOBAL.game.tick;
      //setTimeout(function(){
      //   I.WalkAnim(speed);
      //}, speed)
   }

   Monster.prototype.StopWalkAnim = function(){
      this.walk_anim.start = false;
   }

   Monster.prototype.Move = function(player){
      this.StartWalkAnim();
      Actor.prototype.Move.call(this, player);
   }

   Monster.prototype.Destroy = function(){
      Actor.prototype.Destroy.call(this);
      this.walk_anim = null;
   }

   return Monster;
})