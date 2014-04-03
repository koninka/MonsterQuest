define(['jquery'], function() {
   function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   function Graphic(scene, game) {
      this.width = 1000;
      this.height = 600;
      this.atlas = {
         player : "/imgs/bunny.png",
         grass  : "/imgs/grass_1.png",
         wall   : "/imgs/stone_1.png",
         space  : "/imgs/space_1.png"
      }
      this.textures = {};
      this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
      this.dict = null;
      this.stage = new PIXI.Stage('0x000000', true);
      var I = this;
      var PreloadResourses = function () {
         for(var name in I.atlas) {
            I.textures[name] = PIXI.Texture.fromImage(I.atlas[name]);
         }
      }
      $('#view').append(this.renderer.view);
      PreloadResourses();
      var prevtick;
      var animate = function(){
         stats.begin();
         if(game.tick != prevtick){  
            prevtick = game.tick;
            scene.Draw(I);
            I.renderer.render(I.stage);
         }
         requestAnimFrame( animate );
         stats.end();
      }

      requestAnimFrame( animate );
   }

   Graphic.prototype.Sprite = function(texture){
      return new PIXI.Sprite(this.textures[texture]);
   }

   Graphic.prototype.DrawObj = function(obj, x, y){
      if(x != undefined)
         obj.position.x = x;
      if(y != undefined)
         obj.position.y = y;
      obj.position.x += this.width  / 2;
      obj.position.y += this.height / 2;
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

// pixi mem leak
   PIXI.Text.prototype.destroy = function(destroyTexture)
   {
       this.texture.baseTexture.imageUrl = this.canvas._pixiId;
       this.texture.destroy(destroyTexture);
   };

   PIXI.DisplayObjectContainer.prototype.removeChild = function(child)
   {
      if (child.destroy)child.destroy(true);  //
      if(this.stage)child.removeStageReference();
      child.parent = undefined;
   };

   // https://github.com/GoodBoyDigital/pixi.js/pull/647
   return Graphic;
});