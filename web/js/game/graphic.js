define(function() {
   var WIDTH     = 1200;
   var HEIGHT    = 600;

   var Atlas = {
      player : "/resourses/player",
      grass  : "/resourses/grass",
      wall   : "/resourses/wall"
   }

   function Graphic(scene) {
      //this.stage = null;
      //this.renderer = null;
      //this.dictionary = {'.':'grass', '#':'wall'};
      //this.map = [];
      //this.actors = [];
      this.atlas = //new Atlas();
      {
         player : "/imgs/bunny.png",
         grass  : "/imgs/grass_1.png",
         wall   : "/imgs/stone_1.png"
      }
      this.tileMethods = {};
      this.textures = {};
      var I = this;
      var PreloadResourses = function () {
         //I.game.load.image('bunny', '/resousres/bunny.png');
         for(var name in I.atlas) {
            I.game.load.image(name, I.atlas[name]);
            //console.log(name);
            //onsole.log(I.atlas[name]);
         }
      }

      this.game = new Phaser.Game(
         1000,
         600,
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
      if(obj)
         obj.destroy();
      return obj = this.game.add.sprite(x, y, sprite_name);
   }

   return Graphic;
});