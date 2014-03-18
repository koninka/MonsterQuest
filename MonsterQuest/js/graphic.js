var TILE_SIZE = 32;
var WIDTH = 1200;
var HEIGHT = 600;

function Atlas()
{
    this.atlas = PIXI.BaseTexture.fromImage('/resourses/atlas.png');
    this.textures = {
        'grass' : new PIXI.Texture(this.atlas, new PIXI.Rectangle(0 * TILE_SIZE, 15 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
        'wall'  : new PIXI.Texture(this.atlas, new PIXI.Rectangle(17 * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
        'actor' : new PIXI.Texture(this.atlas, new PIXI.Rectangle(18 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE)),
    };
    this.tileMethods = {
        'grass' : this.TileMethod(this.textures['grass']),
        'wall'  : this.TileMethod(this.textures['wall']),
        'actor' : this.TileMethod(this.textures['actor']),
    };
    this.stage = null;
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
