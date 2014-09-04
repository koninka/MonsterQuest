define(['global', 'options', 'item'], function(GLOBAL, OPTIONS, Item){


    // all tiles must look to east  like this }----->
    function Projectile(item){
        item.name = item.name || "default_projectile";
        Item.call(this, item);
        this.onDoubleClick = null;
        this.onClick       = null;
        this.onRightClick  = null;
    }

    Projectile.prototype = Object.create( Item.prototype );
    Projectile.prototype.constructor = Projectile;

    Projectile.prototype.Move = function(pos){
        var dx = pos.x - this.item.x;
        var dy = pos.y - this.item.y;
        this.drawable.itemTile.rotation = Math.atan2(dy, dx);
        Item.prototype.Move.call(this, pos);
    }

    return Projectile;

})