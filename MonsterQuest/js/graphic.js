var TILE_SIZE = 32;
var WIDTH = 1200;
var HEIGHT = 600;

/*function Atlas()
{

    this.atlas = PIXI.BaseTexture.fromImage('/resourses/atlas.png');
    this.textures = {
        'grass' : new PIXI.Texture(this.atlas, new PIXI.Rectangle(0 * TILE_SIZE, 15 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
        'wall'  : new PIXI.Texture(this.atlas, new PIXI.Rectangle(17 * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
        'actor' : new PIXI.Texture(this.atlas, new PIXI.Rectangle(18 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
    };
    /*this.tileMethods = {
        'grass' : this.TileMethod(this.textures['grass']),
        'wall'  : this.TileMethod(this.textures['wall']),
        'actor' : this.TileMethod(this.textures['actor']),
    }; //
}

Atlas.prototype.TileMethod = function (texture) {
    var th = this;
    return function(x, y){
        var tile = new PIXI.Sprite(texture);
        tile.position.x = x;
        tile.position.y = y;
        th.stage.addChild(tile);
    }
};
*/
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
            player : "/resourses/bunny.png",
            grass  : "/resourses/grass_1.png",
            wall   : "/resourses/stone_1.png"
        }
    this.tileMethods = {};
    this.textures = {};
    var I = this;
    var PreloadResourses = function (){
        //I.game.load.image('bunny', '/resousres/bunny.png');
        for(var name in I.atlas){
            I.game.load.image(name, I.atlas[name]);
            //console.log(name);
            //onsole.log(I.atlas[name]);
        }

    }
    
    this.game = new Phaser.Game(1000, 600, Phaser.AUTO, 'view', 
        { 
            preload: PreloadResourses, 
            update: function(){
                I.game.add.sprite(50,50,'bunny');
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

/*Graphic.prototype.clearView = function() {
    this.stage = new PIXI.Stage;
};

Graphic.prototype.refreshView = function() {
    this.clearView();
    this.drawMap();
    this.drawActors();
};

Graphic.prototype.setMap = function (map) {
    this.map = map;
    this.refreshView();
};

Graphic.prototype.setDictionary = function (dict) {
    this.dictionary = dict;
};

Graphic.prototype.setActors = function(actors) {
    this.actors = actors;
    this.refreshView();
};

Graphic.prototype.drawMap = function () {
    var tileType, x, y;
    for (var i = 0, iL = this.map.length; i < iL; i++) {
        for (var j = 0, jL = this.map[i].length; j < jL; j++) {
            x = j * TILE_SIZE;
            y = i * TILE_SIZE;
            tileType = this.dictionary[this.map[i][j]];
            drawTile = this.tileMethods[tileType];
            drawTile(x, y);
        }
    }
};
*/