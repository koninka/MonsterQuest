define(['actor_simpleTopDown', 'game', 'options', 'global'], function(ActorSTD, game, OPTIONS, GLOBAL){

    function ActorTopDownAnim(id, x, y, type, name, health, init, player){
        ActorSTD.call(this, id, x, y, type, name, health, init, player);
    }

    ActorTopDownAnim.prototype = Object.create(ActorSTD.prototype);
    ActorTopDownAnim.prototype.constructor = ActorTopDownAnim;

    ActorTopDownAnim.prototype.InitBody = function(){
        var legs = new PIXI.MovieClip(GLOBAL.graphic.textures[this.type].legs);
        legs.position.x = legs.position.y = OPTIONS.TILE_SIZE / 2;
        legs.anchor.x = 0.5;
        legs.anchor.y = 0.5;
        legs.rotation = this.dir;
        legs.animationSpeed = 0.2;
        legs.loop = false;
        this.container.addChild(legs);

        var corpse = new PIXI.Sprite(GLOBAL.graphic.textures[this.type].corpse)
        corpse.position.x = corpse.position.y = OPTIONS.TILE_SIZE / 2;
        corpse.anchor.x = 0;
        corpse.anchor.y = 0.5;
        var angle = this.dir;
        if(this.angle)
            angle = this.angle;
        corpse.rotation = angle;
        this.container.addChild(corpse);

        this.container.body = {legs: legs, corpse: corpse};
    }

    ActorTopDownAnim.prototype.Rotate = function(){
        var angle = this.DirToAngle(this.dir);
        this.container.body.legs.rotation = angle;
        if(this.angle)
            angle = this.DirToAngle(this.angle);
        this.container.body.corpse.rotation = angle;
    }

    ActorTopDownAnim.prototype.StartWalkAnim = function(){
        if(!this.container.body.legs.playing)
            this.container.body.legs.gotoAndPlay(0);
    }

    ActorTopDownAnim.prototype.WalkAnim = function(pos){
        if(this.pt.x != pos.x || this.pt.y != pos.y){
            this.StartWalkAnim();
        }
    }

    ActorTopDownAnim.prototype.StopWalkAnim = function(){
        this.container.body.legs.stop();
    }

    ActorTopDownAnim.prototype.Move = function(pos, player){
        this.WalkAnim(pos);
        ActorSTD.prototype.Move.call(this, pos, player);
    }

    return ActorTopDownAnim;
})