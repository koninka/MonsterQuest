define(['jquery', 'options', 'global'], function(JQuery, OPTIONS, global) {
   function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   function Graphic(view, game) {
      this.width = 1000;
      this.height = 600;
      this.atlas = {
         player : "/imgs/character.png",
         grass  : "/imgs/grass_1.png",
         wall   : "/imgs/wall_1.png",
         zombie : {
            corpse: "/imgs/zombie/zombie_corpse_1.png",
            legs  : [
               "/imgs/zombie/zombie_legs_1.png",
               "/imgs/zombie/zombie_legs_2.png",
               "/imgs/zombie/zombie_legs_3.png",
               "/imgs/zombie/zombie_legs_4.png",
               "/imgs/zombie/zombie_legs_5.png",
               "/imgs/zombie/zombie_legs_6.png",
               "/imgs/zombie/zombie_legs_7.png",
               "/imgs/zombie/zombie_legs_8.png"
            ]
         }
      }
      this.textures = {};
      this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
      this.dict = null;
      this.stage = new PIXI.Stage('0x000000', true);
      this.pointer = {};
      var I = this;
      var loadA = function(t, a){
         if(a instanceof Array){
            t = [];
            for (var i = 0; i < a.length; ++i)
               t.push(loadA({}, a[i]))
         } else if(a instanceof Object){
            t = {}
            for(var i in a){
               t[i] = loadA({}, a[i]);
            }
         } else
            t = PIXI.Texture.fromImage(a);
         return t;
      }
      var PreloadResourses = function () {
         I.textures = loadA({}, I.atlas);
      }
      $('#view').append(this.renderer.view);
      $('#view').bind('contextmenu', function(){
         return false;
      });
      $(this.renderer.view).mousemove(function( event ) {
         I.pointer.x = event.clientX - $(this).offset().left - I.width  / 2;
         I.pointer.y = event.clientY - $(this).offset().top  - I.height / 2;
      })
      global.graphic = this;
      PreloadResourses();
      var prevtick;
      var animate = function(){
         stats.begin();
         if(view.player.container)
            view.player.Rotate();
         I.renderer.render(I.stage);
         requestAnimFrame( animate );
         stats.end();
      }

      requestAnimFrame( animate );
   }

   Graphic.prototype.Texture = function(texture){
      return this.textures[texture];
   }

   Graphic.prototype.Sprite = function(texture){
      return new PIXI.Sprite(this.textures[texture]);
   }

   Graphic.prototype.Center = function(obj){
      obj.position.x += this.width  / 2;
      obj.position.y += this.height / 2;
   }

   Graphic.prototype.DrawObj = function(obj, x, y){
      if(x != undefined)
         obj.position.x = x;
      if(y != undefined)
         obj.position.y = y;
      this.Center(obj);
      this.stage.addChild(obj);
      return obj;
   }

   Graphic.prototype.Draw = function(texture, x, y){
      var tile = this.Sprite(texture);
      return this.DrawObj(tile, x, y);
   }

   Graphic.prototype.Clear = function(){
      for (var i = this.stage.children.length - 1; i >= 0; i--) {
         this.stage.removeChild(this.stage.children[i]);
      }
      this.stage.children = [];
   }

   Graphic.prototype.Remove = function(sprite){
      this.stage.removeChild(sprite)
   }

   Graphic.prototype.drawGroup = function(group, x, y) {
      return this.DrawObj(group, x, y);
   }

   Graphic.prototype.Text = function(text, style, x, y){
      var text = new PIXI.Text(text, style);
      if(x != undefined)
         text.position.x = x;
      if(y != undefined)
         text.position.y = y;
      return text;
   }

   Graphic.prototype.angleToPointer = function(){
      dx = this.pointer.x;
      dy = this.pointer.y;
      return Math.atan2(dy, dx);
   }

   //closed up pixi mem leak
   PIXI.Text.prototype.destroy = function(destroyTexture){
       this.texture.baseTexture.imageUrl = this.canvas._pixiId;
       this.texture.destroy(destroyTexture);
   };

   /*PIXI.DisplayObjectContainer.prototype.removeChild = function(child){
      if(this.stage)child.removeStageReference();
      child.parent = undefined;
   };*/

   PIXI.DisplayObjectContainer.prototype.removeStageReference = function(){
      if (this.destroy)this.destroy(true);  //

      for(var i=0,j=this.children.length; i<j; i++){
        var child = this.children[i];
        child.removeStageReference();
      }

      if(this._interactive)this.stage.dirty = true;

      this.stage = null;
   };

   // https://github.com/GoodBoyDigital/pixi.js/pull/647
   return Graphic;
});