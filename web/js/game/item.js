define(['global', 'options'], function(GLOBAL, OPTIONS){

    function Item(item){
        this.item = item;
        this.type = item.type;
        this.name = item.name;
        this.id = item.id;
        this.amount = item.amount;
        this.InitSprite();
        var m = this.item;
        this.onClick = function(data){
            data.originalEvent.preventDefault();
            GLOBAL.game.sendViaWS({action: "pickUp", id: m.id});
        }
        this.onRightClick = function(data){
            data.originalEvent.preventDefault();
            var keys = KeyboardJS.activeKeys();
            if(keys[0] == 'ctrl')
                GLOBAL.game.sendViaWS({action: "destroyItem", id: m.id});
            else
                GLOBAL.game.sendViaWS({action: "examine", id: m.id});
        }
    }

    Item.prototype.constructor = Item;

    Item.prototype.InitSprite = function (){
        var drawable = new PIXI.DisplayObjectContainer();
        this.drawable = drawable;
        var tile = GLOBAL.graphic.Sprite(this.item.name);
        tile.position.x = tile.position.y = OPTIONS.TILE_SIZE / 2;
        tile.anchor = {x : 0.5, y : 0.5};
        drawable.itemTile = tile;
        drawable.addChild(tile);
        drawable.interactive = true;
        var m = this;
        drawable.click = function(data){
            var now = Date.now();
            var lc = drawable.click.lastClick;
            var diff = now - lc;
            var event = data.originalEvent;
            if(event.which == 3 || event.button == 2) {
                if(m.onRightClick)
                    m.onRightClick(data);
            } else if(lc && (diff < 350)) {
                drawable.click.lastClick = 0;
                if(m.onDoubleClick)
                    m.onDoubleClick(data);
            } else {
                drawable.click.lastClick = now;
                if(m.onClick)
                    m.onClick(data);
            }
        }
        drawable.click.lastClick = 0;
        GLOBAL.graphic.DrawObj(
            drawable,
            drawable.position.x = (this.item.x - GLOBAL.game.player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
            drawable.position.y = (this.item.y - GLOBAL.game.player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
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