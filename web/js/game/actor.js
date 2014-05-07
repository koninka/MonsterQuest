define(['options', 'global'] ,function(OPTIONS, GLOBAL){

    function Actor(id, x, y, type, health, name){
        this.id    = id;
        this.pt    = {x: x, y: y};
        this.type  = type;
        this.angle = undefined;
        this.dir = undefined;
        this.health = health;
        this.name = name || this.type || "unknown";
    }

    Actor.prototype.PosToDir = function(pos){
        var pt = this.pt;
        var x = pos.x;
        var y = pos.y;
        var res = this.dir;
        if(pt.x < x){
             res = "right";
        } else if(pt.x > x){
             res = "left";
        }
        if(pt.y < y){
             res = "down";
        } else if(pt.y > y){
             res = "top";
        }
        return res;
    }

    Actor.prototype.Move = function(pos){
        this.dir = this.PosToDir(pos);
        this.pt = pos;
    }

    Actor.prototype.SetHP = function(hp){
        this.health = hp;
    }

    Actor.prototype.Kill = function(){
        this.SetHP(0);
    }

    Actor.prototype.Destroy = function(){
        this.id = undefined;
        this.pt = undefined;
        this.type = undefined;
        this.angle = undefined;
        this.dir = undefined;
    }

    return Actor;
})