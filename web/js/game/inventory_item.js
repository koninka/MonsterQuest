define(['global', 'OPTIONS', 'item'], function(GLOBAL, OPTIONS, Item){
    function find_slot(item){
        return undefined;
    }

    function InventoryItem(item){
        Item.call(this, item);
        var m = this.item;
        this.onDoubleClick = function(){
            if(m.equiped){
                GLOBAL.game.sendViaWS({action: "unequip", id: m.id});
            }else{
                GLOBAL.game.sendViaWS({action: "equip", id: m.id, slot: fund_slot(m)});
            }
        }
        this.onRightClick = function(){
            GLOBAL.game.sendViaWS({action: "drop", id: m.id});
        }
    }

    InventoryItem.prototype = Object.create( Item.prototype );
    InventoryItem.prototype.constructor = InventoryItem;

    InventoryItem.prototype.SetPosition = function (cell){
        this.item.position = cell;
        this.drawable.position = {x: cell.x * OPTIONS.TILE_SIZE, y: cell.y * OPTIONS.TILE_SIZE};
    }

    return InventoryItem;
})