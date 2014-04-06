define(['actor', 'game', 'options'], function(Actor, game, OPTIONS){

   function Monster(id, x, y, type){
      Actor.call(this, id, x, y, type);
      this.walk_anim = 0;
   }

   Monster.prototype = Object.create(Actor.prototype);
   Monster.prototype.constructor = Monster;

   Monster.prototype.DrawSpecial = function(graphic, actor){
       if(graphic.textures[this.type].legs.length <= this.walk_anim)
         this.walk_anim = 0;
      var legs = new PIXI.Sprite(graphic.textures[this.type].legs[this.walk_anim]);
      legs.position.x = legs.position.y = OPTIONS.TILE_SIZE / 2;
      legs.anchor.x = 0.5;
      legs.anchor.y = 0.5;
      legs.rotation = this.dir;
      
      var corpse = new PIXI.Sprite(graphic.textures[this.type].corpse)
      corpse.position.x = corpse.position.y = OPTIONS.TILE_SIZE / 2;
      corpse.anchor.x = 0;
      corpse.anchor.y = 0.5;
      var angle = this.dir;
      if(this.angle)
         angle = this.angle;
      //var angle = graphic.angleToPointer(this.pt);
      corpse.rotation = angle;
      
      actor.addChild(legs);
      actor.addChild(corpse);
   }

   return Monster;
})