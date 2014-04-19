define(['options', 'global', 'actor'] ,function(OPTIONS, GLOBAL, Actor){

   function ActorWithContainer(id, x, y, type, initAnimation, player){
      Actor.call(this, id, x, y, type);
      if(initAnimation === undefined) initAnimation = true;
      this.InitAnimation(initAnimation, player);
   }

   ActorWithContainer.prototype = Object.create(Actor.prototype);
   ActorWithContainer.prototype.constructor = ActorWithContainer;

   ActorWithContainer.prototype.InitAnimation = function(init, player){
      if(!init) return;
      this.Init(player);
      //this.InitBody();
   }

   ActorWithContainer.prototype.Init = function(player){
      this.InitContainer(player);
   }

   ActorWithContainer.prototype.InitContainer = function(player){
      this.container = new PIXI.DisplayObjectContainer(); 
      this.container.interactive = true;
      var m = this;
      this.container.click = function(data){
         var now = Date.now();
         var lc = m.container.click.lastClick;
         var diff = now - lc;
         var event = data.originalEvent;
         if(event.which == 3 || event.button == 2) {
         //this was a right click;
            GLOBAL.game.sendViaWS({action: "examine", id: m.id});
         } else if(lc && (diff < 350)) {
            m.container.click.lastClick = 0;
         //this was a double click
         } else {
            m.container.click.lastClick = now;
            GLOBAL.game.sendViaWS({action: "attack", id: m.id});
         //this was a regular click
         }
      }
      this.container.click.lastClick = 0;
      GLOBAL.graphic.DrawObj(
         this.container,
         this.container.position.x = (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
         this.container.position.y = (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
      )
   }

   ActorWithContainer.prototype.MoveContainer = function(player){
      this.container.position.x = (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
      this.container.position.y = (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
      GLOBAL.graphic.Center(this.container);
   }

   ActorWithContainer.prototype.Move = function(pos, player){
      Actor.prototype.Move.call(this, pos)
      this.MoveContainer(player)
   }

   ActorWithContainer.prototype.Destroy = function(){
      Actor.prototype.Destroy.call(this);
      GLOBAL.graphic.Remove(this.container);
      this.container = undefined;
   }

   return ActorWithContainer;
})