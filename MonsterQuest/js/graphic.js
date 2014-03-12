
var tail_size = 32; //px

var graphic = {
    stage : undefined,
    dictionary : {'.':'grass', '#':'wall'},
    map : [],
    actors : [{"type":"player","x":5,"y":5}], //test
    textures : {
        'grass' : PIXI.Texture.fromImage('/resourses/grass_1.png'),
        'wall'  : PIXI.Texture.fromImage('/resourses/stone_1.png'),
        'actor' : PIXI.Texture.fromImage('/resourses/bunny.png'),
    },
    clearView : function(){
        graphic.stage.children = [];
    },

    drawActors : function (actors) {
        actors = actors || this.actors;
        $(actors).each(function(key, val){
        
            graphic.tileMethods['actor'](val.x, val.y)
        })
    },

    refreshView : function(){
        graphic.clearView();
        graphic.drawMap();
        graphic.drawActors();
    },

    setMap : function (map){
        graphic.map = map;
        graphic.refreshView();
    },

    setDictionary : function (dict){
        graphic.dictionary = dict;
    },

    setActors : function(actrs){
    	graphic.actors = actrs;
    	graphic.refreshView();
    },

    drawMap : function (map) {
        var tileType, x, y;
        map = map || graphic.map;
        for (var i = 0, iL = map.length; i < iL; i++) {
            for (var j = 0, jL = map[i].length; j < jL; j++) {
                x = j * 32;
                y = i * 32;
                tileType = graphic.dictionary[map[i][j]];
                drawTile = graphic.tileMethods[tileType];
                drawTile(x, y);
            }
        }
    }
}

graphic.tileMethods = {
    'grass' : TileMethod(graphic.textures['grass']),
    'wall'  : TileMethod(graphic.textures['wall']),
    'actor' : TileMethod(graphic.textures['actor'])
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

function TileMethod(texture){
    return function(x, y){
        var tile = new PIXI.Sprite(texture);
        tile.position.x = x;
        tile.position.y = y;
        graphic.stage.addChild(tile);
    }
}





$(document).ready(function(){
	var WIDTH = 1200;
    var HEIGHT = 600;
    graphic.map = testTerrain;
    graphic.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
    $("#view").append(graphic.renderer.view);
    graphic.stage = new PIXI.Stage;
    requestAnimationFrame(animate);
    graphic.refreshView();
    function animate() {
        graphic.renderer.render(graphic.stage);
        requestAnimationFrame(animate);
    }
})