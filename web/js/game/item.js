define(['global', 'OPTIONS'], function(GLOBAL, OPTIONS){

    function Item(id, type, position){
        this.item = item;
        this.InitSprite();
    }

    Item.prototype.constructor = Item;

    Item.prototype.InitSprite = function (){
        var tile = GLOBAL.graphic.Sprite(this.item.name);
        tile.anchor.x = 0.5;
        tile.anchor.y = 0.5;
        //tile.rotation = this.dir;
        //this.drawable.addChild(tile);
        this.drawable = tile;
    }

    Item.prototype.SetPosition = function (pos){
        this.item.position = pos;
        this.drawable.position.x = (pos - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        this.drawable.position.y = (pos - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        GLOBAL.graphic.Center(this.drawable);
    }

    return Item;
})