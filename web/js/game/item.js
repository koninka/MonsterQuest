define(['global', 'OPTIONS'], function(GLOBAL, OPTIONS){

    function Item(id, type, position){
        this.id = id;
        this.type = type;
        this.position = position;
    }

    Item.prototype.constructor = Item;

    function InventoryItem(id, type, cell){
        Item.call(this, id, type, cell);
        this.InitSprite();
    }

    InventoryItem.prototype.InitSprite = function (){
        var tile = GLOBAL.graphic.Sprite(this.type);
        tile.anchor.x = 0.5;
        tile.anchor.y = 0.5;
        //tile.rotation = this.dir;
        //this.drawable.addChild(tile);
        this.drawable = tile;
    }

    InventoryItem.prototype.SetCell = function (cell){
        this.position = cell;
        this.drawable.position = {x: cell.x * OPTIONS.TILE_SIZE, y: cell.y * OPTIONS.TILE_SIZE};
    }

    return {
        Item: Item,
        InventoryItem: InventoryItem
    }
})