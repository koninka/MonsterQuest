define(['global', 'OPTIONS'], function(GLOBAL, OPTIONS){

    function Item(item){
        this.item = item;
        this.InitSprite();
        var m = this.item;
        this.onClick = function(){
            GLOBAL.game.sendViaWS({action: "pickUp", id: m.id});
        }
        this.onRightClick = function(){
            GLOBAL.game.sendViaWS({action: "examine", id: m.id});
        }
    }

    Item.prototype.constructor = Item;

    Item.prototype.InitSprite = function (){
        var tile = GLOBAL.graphic.Sprite(this.item.name);
        this.drawable = tile;
        tile.interactive = true;
        var m = this;
        tile.click = function(data){
            var now = Date.now();
            var lc = tile.click.lastClick;
            var diff = now - lc;
            var event = data.originalEvent;
            if(event.which == 3 || event.button == 2) {
                if(m.onRightClick)
                    m.onRightClick();
            } else if(lc && (diff < 350)) {
                tile.click.lastClick = 0;
                if(m.onDoubleClick)
                    m.onDoubleClick();
            } else {
                tile.click.lastClick = now;
                if(m.onClick)
                    m.onClick();
            }
        }
        tile.click.lastClick = 0;
        GLOBAL.graphic.DrawObj(
            tile,
            tile.position.x = (this.item.x - GLOBAL.game.player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
            tile.position.y = (this.item.y - GLOBAL.game.player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
        )
    }

    Item.prototype.Move = function (pos){
        this.item.x = pos.x;
        this.item.y = pos.y;
        this.drawable.position.x = (pos.x - GLOBAL.game.player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        this.drawable.position.y = (pos.y - GLOBAL.game.player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        GLOBAL.graphic.Center(this.drawable);
    }

    Item.prototype.Destroy = function(){
        //Item.prototype.Destroy.call(this);
        GLOBAL.graphic.Remove(this.drawable);
        this.drawable = undefined;
    }

    return Item;
})