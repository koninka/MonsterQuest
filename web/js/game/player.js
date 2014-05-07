define(['actor_rpg', 'global'], function(ActorRPG, GLOBAL){

    function Player(id) {
        //id, x, y, type, health, name, init, player, opt
        ActorRPG.call(this, id, 0, 0, 'Scrawny cat', {cur: 100, max: 100}, null, false, this, {idle: true});
        this.login = null;
    }

    Player.prototype = Object.create(ActorRPG.prototype);
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