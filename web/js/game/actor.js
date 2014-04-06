define(['options'] ,function(OPTIONS){
   function Actor(id, x, y, type){
      this.id    = id;
      this.pt    = {x: x, y: y};
      this.type  = type;
      this.angle = null;
      this.dir = null;
   }

   Actor.prototype.DrawSpecial = function(graphic, actor){
      var tile = graphic.Sprite('player');
      tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
      tile.rotation = this.dir;
      actor.addChild(tile);
   }

   Actor.prototype.Draw = function(graphic, game, player){
      var actor = new PIXI.DisplayObjectContainer();
      this.DrawSpecial(graphic, actor);
      var login = this.login || (this.type + this.id);
      var txt = graphic.Text( 
         login, 
         {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'},
         0, 
         OPTIONS.TILE_SIZE + 7
      )
      txt.position.x = (OPTIONS.TILE_SIZE - txt.width) / 2 + 2;
      actor.addChild(txt);
      actor.interactive = true;
      var m = this;
      actor.mousedown = function(data){
         game.sendViaWS({action: "examine", id: m.id});
      }
      graphic.DrawObj(
         actor,
         (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
         (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
      );
   }

   return Actor;
})