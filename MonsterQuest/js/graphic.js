var TAIL_SIZE = 32; //px
var WIDTH = 1200;
var HEIGHT = 600;

function Graphic() {
    this.stage = null,
    this.renderer = null,
    this.dictionary = {'.':'grass', '#':'wall'},
    this.map = [],
    this.actors = [{"type":"player","x":5,"y":5}], //test
    this.atlas = null,
    this.tileMethods = {}
    this.textures = {},

    this.clearView = function(){
        this.stage = new PIXI.Stage;
    },

    this.drawActors = function (actors) {
        var th = this;
        actors = actors || this.actors;
        $(actors).each(function(key, val){
            th.tileMethods['actor'](val.x, val.y)
        })
    },

    this.refreshView = function(){
        this.clearView();
        this.drawMap();
        this.drawActors();
    },

    this.setMap = function (map){
        this.map = map;
        this.refreshView();
    },

    this.setDictionary = function (dict){
        this.dictionary = dict;
    },

    this.setActors = function(actrs){
    	this.actors = actrs;
    	this.refreshView();
    },

    this.drawMap = function (map) {
        var tileType, x, y;
        map = map || this.map;
        for (var i = 0, iL = map.length; i < iL; i++) {
            for (var j = 0, jL = map[i].length; j < jL; j++) {
                x = j * 32;
                y = i * 32;
                tileType = this.dictionary[map[i][j]];
                drawTile = this.tileMethods[tileType];
                drawTile(x, y);
            }
        }
    },

    this.TileMethod = function (texture){
        var th = this;
        return function(x, y){
            var tile = new PIXI.Sprite(texture);
            tile.position.x = x;
            tile.position.y = y;
            th.stage.addChild(tile);
        }
    },

    this.Init = function() {
        this.atlas = PIXI.BaseTexture.fromImage('/resourses/atlas.png');
        this.textures = {
            'grass' : new PIXI.Texture(this.atlas, new PIXI.Rectangle(0, 480, 32, 32)),
            'wall'  : new PIXI.Texture(this.atlas, new PIXI.Rectangle(544, 448, 32, 32)),
            'actor' : PIXI.Texture.fromImage('/resourses/bunny.png')
        }
        this.tileMethods = {
            'grass' : this.TileMethod(this.textures['grass']),
            'wall'  : this.TileMethod(this.textures['wall']),
            'actor' : this.TileMethod(this.textures['actor'])
        }
    }
}

var testTerrain = [
    ['#','#','#','#','#','#','#'],
    ['#','.','.','.','.','.','#'],
    ['#','.','.','.','.','.','#'],
    ['#','.','.','.','.','.','#'],
    ['#','.','.','.','.','.','#'],
    ['#','.','.','.','.','.','#'],
    ['#','#','#','#','#','#','#']
]