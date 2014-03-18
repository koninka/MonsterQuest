function Background(){
	this.map = [
		['.', '.','.','.','.'],
		['.', '.','.','.','.'],
		['.', '.','.','.','.'],
		['.', '.','.','.','.'],
		['.', '.','.','.','.'],
		['.', '.','.','.','.']
	]   // map from look
	this.cells = [] // sprites objects
	this.dictionary = {'.':'grass', '#':'wall'};
}

Background.prototype.Draw = function(graphic){
	//this.cells = [];
	this.cells = [];
	for(var i = 0; i < this.map.length; ++i){
		this.cells.push([]);
		for(var j = 0; j < this.map[i].length; ++j){
			x = j * TILE_SIZE;
            y = i * TILE_SIZE;
            this.cells[i].push(graphic.DrawObj(null, x, y, this.dictionary[this.map[i][j]]))
		}
	}
}
{
	this.player = null;
	this.players = [];
	this.background = null;
}

Scene.prototype.Draw = function()
{
	this.Clear();
	this.background.Draw();
	for (player in players) {
		player.Draw();
	}
	this.player.Draw();   
    graphic.renderer.render(graphic.stage);
    requestAnimationFrame(this.Draw);
}

Scene.prototype.Clear = function(){
	graphic.refreshView();
}
