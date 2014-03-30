define(['jquery'], function() {
   function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   function Graphic(scene) {
      this.width = 1000;
      this.height = 600;
      this.atlas = {
         player : "/imgs/bunny.png",
         grass  : "/imgs/grass_1.png",
         wall   : "/imgs/stone_1.png",
         space  : "/imgs/space_1.png"
         //empty  : "/imgs/stone_1.png",
      }
      this.tileMethods = {
         //space : function(sprite){
         //   sprite.frameName = 'space_' + getRandomInt(1, 4) + '.png'; 
         //}
      };
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
      var animate = function(){
         requestAnimFrame( animate );
         scene.Draw(I);
         I.renderer.render(I.stage);
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
      };
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

   return Graphic;
});