function Scene()
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