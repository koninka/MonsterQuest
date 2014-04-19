define(['actor_animTopDown', 'game', 'options', 'global'], function(ActorATD, game, OPTIONS, GLOBAL){

   function ActorRPG(id, x, y, type, init, player){
      ActorATD.call(this, id, x, y, type, init, player);
   }

   ActorRPG.prototype = Object.create(ActorATD.prototype);
   ActorRPG.prototype.constructor = ActorRPG;

   ActorRPG.prototype.InitBody = function(){
      this.container.pics = GLOBAL.graphic.textures[this.type];
      this.container.state = "wait";
      var corpse = new PIXI.MovieClip(GLOBAL.graphic.textures[this.type].wait.right);
      corpse.position.x = corpse.position.y = OPTIONS.TILE_SIZE / 2;
      corpse.anchor.x = 0.5;
      corpse.anchor.y = 0.5;
      corpse.rotation = this.dir;
      corpse.animationSpeed = 0.1;
      corpse.loop = false;
      var I = this;
      I.dir = "right"
      corpse.onComplete = function(){
         I.container.state = "wait";
         setTimeout(function(){
            if(I.container && I.container.state == "wait"){
              corpse.textures = I.container.pics.wait[I.dir];
               corpse.gotoAndStop(0); 
            }
         }, 100)
      }
      this.container.addChild(corpse);
      this.container.body = corpse;
   }

   ActorRPG.prototype.Rotate = function(){
      /*var dir = this.dir;
      if(this.angle)
         angle = this.angle;
      this.container.body.corpse.rotation = angle;*/
   }

   ActorRPG.prototype.StartWalkAnim = function(){
      if(!this.container.body.playing)
         this.container.body.gotoAndPlay(0);
   }

   ActorRPG.prototype.WalkAnim = function(pos){
      if(this.pt.x != pos.x || this.pt.y != pos.y){
         var d = this.PosToDir(pos);
         var s = "walk";
         if(this.dir != d || this.container.state != s)
            this.container.body.textures = this.container.pics[s][d];
         this.container.state = s;
         this.StartWalkAnim();
      }
   }

   ActorRPG.prototype.StopWalkAnim = function(){
      this.container.body.stop();
   }

   return ActorRPG;
})