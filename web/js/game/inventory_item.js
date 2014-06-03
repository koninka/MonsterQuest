define(['global', 'OPTIONS', 'item'], function(GLOBAL, OPTIONS, Item){

    function InventoryItem(item){
        Item.call(this, item);
    }

    InventoryItem.prototype = Object.create( Item.prototype );
    InventoryItem.prototype.constructor = InventoryItem;

    InventoryItem.prototype.SetPosition = function (cell){
        this.item.position = cell;
        this.drawable.position = {x: cell.x * OPTIONS.TILE_SIZE, y: cell.y * OPTIONS.TILE_SIZE};
    }

    return InventoryItem;
})