define(['actor_simpleTopDown', 'global'], function(ActorSTD, GLOBAL){

    function Player(id, name, health, mHealth) {
        //id, x, y, type, health, name, init, player, opt
        ActorSTD.call(this, id, 0, 0, 'player', {cur: health, max: mHealth}, name, false, this, {idle: true});
        this.login = name;
    }

    Player.prototype = Object.create(ActorSTD.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.examineSuccess = function(data) {
        this.pt.x = data["x"];
        this.pt.y = data["y"];
        this.type = data["type"];
        this.login = data["login"];
        this.name = this.login;
    }

    return Player;
});