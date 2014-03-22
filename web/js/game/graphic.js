define(function() {
   function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   function Graphic(scene) {
      this.WIDTH = 1000;
      this.HEIGHT = 600;
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
      var I = this;
      var PreloadResourses = function () {
         //I.game.
         //I.game.load.atlas('space', '/imgs/space.spritesheet.png', '/imgs/space.spritesheet.json');
         for(var name in I.atlas) {
            I.game.load.image(name, I.atlas[name]);
         }
      }

      this.game = new Phaser.Game(
         this.WIDTH,
         this.HEIGHT,
         Phaser.AUTO,
         'view',
         {
            preload: PreloadResourses,
            update: function() {
               scene.Draw(I);
            }
         }
      )
   }

   Graphic.prototype = Object.create(Phaser);

   Graphic.prototype.DrawObj = function(obj, x, y, sprite_name){
      var obj = this.game.add.sprite(x + this.game.width / 2 , y + this.game.height / 2, sprite_name);
      //if(this.tileMethods[sprite_name]){
      //   this.tileMethods[sprite_name](obj)
      //}
      return obj;
   }

   Graphic.prototype.Clear = function(){

      //this.game.stage = new Phaser.Stage(this.game, this.game.width, this.game.height);
      //this.game.world.stage = this.game.stage;
      //this.game.add.world = this.game.world;
      //PIXI.Stage.call(this.game.stage, 0x000000, false);
      this.game.world.children = []
   }

   Graphic.prototype.drawGroup = function(group, x, y) {
      group.x = x + this.game.width  / 2;
      group.y = y + this.game.height / 2;
      this.game.world.add(group);
   }

   return Graphic;
});