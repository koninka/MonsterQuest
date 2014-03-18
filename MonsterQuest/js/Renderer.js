/*function Scene(player) {
	this.player = player;
	this.players = [];
	this.background = null;
}

function Renderer(scene)
{
	this.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
	this.dict = null;
	this.atlas = new Atlas();
	this.atlas.stage = new PIXI.Stage;
	this.scene = scene;
}

Renderer.prototype.Render = function() {
	scene = this.scene;
	this.atlas.stage = new PIXI.Stage;
	this.drawMap(scene.background);
	for (player in scene.players)
		this.atlas.tileMethods['actor'](player.pt.x, player.pt.y);
	this.atlas.tileMethods['actor'](scene.player.pt.x, scene.player.pt.y);
	this.renderer.render(this.atlas.stage);
};

Renderer.prototype.drawMap = function (map) {
    map = map || [];
    var tileType, x, y;
    for (var i = 0, iL = map.length; i < iL; i++) {
        for (var j = 0, jL = map[i].length; j < jL; j++) {
            x = j * TILE_SIZE;
            y = i * TILE_SIZE;
            tileType = this.dict[map[i][j]];
            drawTile = this.atlas.tileMethods[tileType];
            drawTile(x, y, this.stage);
        }
    }
};*/