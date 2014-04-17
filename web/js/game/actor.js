define(['options', 'global'] ,function(OPTIONS, GLOBAL){

   function Actor(id, x, y, type, initAnimation, player){
      this.id    = id;
      this.pt    = {x: x, y: y};
      this.type  = type;
      this.angle = undefined;
      this.dir = undefined;
      if(initAnimation === undefined) initAnimation = true;
      this.InitAnimation(initAnimation, player);
   }

   Actor.prototype.InitAnimation = function(init, player){
      if(!init) return;
      this.InitSprite(player);
   }

   Actor.prototype.InitSprite = function(player){
      this.container = new PIXI.DisplayObjectContainer();
      //this.InitName(this.login || (this.type + this.id));
      this.InitBody();
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

   Actor.prototype.InitName = function(name){
      var txt = GLOBAL.graphic.Text( 
         name, 
         {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'},
         0, 
         OPTIONS.TILE_SIZE + 7
      )
      txt.position.x = (OPTIONS.TILE_SIZE - txt.width) / 2 + 2;
      this.container.addChild(txt);
      this.container.name = txt;
   }

   Actor.prototype.InitBody = function(){
      var tile = GLOBAL.graphic.Sprite(this.type);
      tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
      tile.rotation = this.dir;
      this.container.addChild(tile);
      this.container.body = tile;
   }

   Actor.prototype.Rotate = function(){
      this.container.body.rotation = this.dir;
   }

   Actor.prototype.Move = function(player){
      this.container.position.x = (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
      this.container.position.y = (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
      GLOBAL.graphic.Center(this.container);
   }

   Actor.prototype.Destroy = function(){
      this.id = undefined;
      this.pt = undefined;
      this.type = undefined;
      this.angle = undefined;
      this.dir = undefined;
      GLOBAL.graphic.Remove(this.container);
      this.container = undefined;
   }

   return Actor;
})