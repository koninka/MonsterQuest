define(['options', 'global', 'actor_w_container'] ,function(OPTIONS, GLOBAL, ActorWC){

    function ActorAngband(id, x, y, type, health, name, initAnimation, player){
        ActorWC.call(this, id, x, y, type, health, name, initAnimation, player);
    }

    ActorAngband.prototype = Object.create(ActorWC.prototype);
    ActorAngband.prototype.constructor = ActorAngband;

    ActorAngband.prototype.Init = function(player){
        ActorWC.prototype.Init.call(this, player);
        this.InitBody();
    }

    ActorAngband.prototype.InitBody = function(){
        var tile = GLOBAL.graphic.Sprite(this.type);
        tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
        tile.anchor.x = 0.5;
        tile.anchor.y = 0.5;
        //tile.rotation = this.dir;
        this.container.addChild(tile);
        this.container.body = tile;
    }

    return ActorAngband;
})