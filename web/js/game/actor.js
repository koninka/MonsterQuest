define(['options'] ,function(OPTIONS){
   function Actor(id, x, y, type){
      this.id    = id;
      this.pt    = {x: x, y: y};
      this.type  = type;
      this.angle = null;
      this.dir = null;
   }

   Actor.prototype.Draw = function(graphic, player){
      var playerGroup = new PIXI.DisplayObjectContainer();
      var tile = graphic.Sprite('player');
      tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
      tile.anchor.x = 0.5;
      tile.anchor.y = 0.5;
      tile.rotation = this.dir;
      var login = this.login || (this.type + this.id);
      var txt = graphic.Text( 
         login, 
         {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'},
         0, 
         OPTIONS.TILE_SIZE + 7
      )
      txt.position.x = (tile.width - txt.width) / 2 + 2;
      playerGroup.addChild(tile);
      playerGroup.addChild(txt);
      graphic.DrawObj(
         playerGroup,
         (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - tile.texture.width / 2,
         (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - tile.texture.height / 2
      );
   }

   return Actor;
})