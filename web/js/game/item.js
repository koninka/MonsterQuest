define(['global', 'OPTIONS'], function(GLOBAL, OPTIONS){

    function Item(item){
        this.item = item;
        this.InitSprite();
        var m = this;
        this.onClick = function(){
            GLOBAL.game.sendViaWS({action: "examine", id: m.id});
        }
        this.onRightClick = function(){
            GLOBAL.game.sendViaWS({action: "pickUp", id: m.id});
        }
    }

    Item.prototype.constructor = Item;

    Item.prototype.InitSprite = function (){
        var tile = GLOBAL.graphic.Sprite(this.item.name);
        tile.anchor.x = 0.5;
        tile.anchor.y = 0.5;
        //tile.rotation = this.dir;
        //this.drawable.addChild(tile);
        this.drawable = tile;
        tile.interactive = true;
        var m = this;
        tile.click = function(data){
            var now = Date.now();
            var lc = tile.click.lastClick;
            var diff = now - lc;
            var event = data.originalEvent;
            if(event.which == 3 || event.button == 2) {
                if(m.onClick)
                    m.onClick();
            } else if(lc && (diff < 350)) {
                tile.click.lastClick = 0;
                if(m.onDoubleClick)
                    m.onDoubleClick();
            } else {
                tile.click.lastClick = now;
                if(m.onRightClick)
                    m.onRightClick();
            }
        }
        this.container.click.lastClick = 0;
    }

    Item.prototype.Move = function (pos){
        this.item.position = pos;
        this.drawable.position.x = (pos - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        this.drawable.position.y = (pos - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        GLOBAL.graphic.Center(this.drawable);
    }

    return Item;
})