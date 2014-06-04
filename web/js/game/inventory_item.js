define(['global', 'OPTIONS', 'item'], function(GLOBAL, OPTIONS, Item){
    function find_slot(item){
        return undefined;
    }

    function CoordsToCellNumb(coords){
        var cell = {};
        cell.x = Math.floor(coords.x / OPTIONS.TILE_SIZE);
        cell.y = Math.floor(coords.y / OPTIONS.TILE_SIZE);
        if(cell.x < 0 || cell.y < 0 || cell.x >= OPTIONS.inventory_size.x || cell.y >= OPTIONS.inventory_size.y)
            return null;
        var n = cell.x + cell.y * OPTIONS.inventory_size.x;
        return n;
    }

    function InventoryItem(item){
        Item.call(this, item);
        var m = this.item;
        this.onDoubleClick = function(data){
            data.originalEvent.preventDefault();
            if(m.equiped){
                GLOBAL.game.sendViaWS({action: "unequip", id: m.id});
            }else{
                GLOBAL.game.sendViaWS({action: "equip", id: m.id, slot: fund_slot(m)});
            }
        }
        this.onRightClick = function(data){
            data.originalEvent.preventDefault();
            var keys = KeyboardJS.activeKeys();
            if(keys[0] == 'shift')
                GLOBAL.game.sendViaWS({action: "drop", id: m.id});
            else
                GLOBAL.game.sendViaWS({action: "examine", id: m.id});
        }
        this.drawable.mousedown = function(data){
            data.originalEvent.preventDefault();
            this.data = data;
            this.alpha = 0.9;
            this.dragging = true;
        }
        this.drawable.mouseup = this.drawable.mouseupoutside = function(data){
            this.alpha = 1;
            this.dragging = false;
            //var newPosition = this.data.getLocalPosition(this.parent);
            this.data = null;
            var cell = CoordsToCellNumb(this.position);
            if(cell !== null)
                GLOBAL.game.sendViaWS({action: "moveItem", id: m.id, cell: cell});
        }
        this.drawable.mousemove =  function(data){
            if(this.dragging){
                var newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
            }
        }
    }

    InventoryItem.prototype = Object.create( Item.prototype );
    InventoryItem.prototype.constructor = InventoryItem;

    InventoryItem.prototype.SetPosition = function (cell){
        this.item.x = cell.x;
        this.item.y = cell.y;
        if(!this.drawable.dragging)
            this.drawable.position = {x: cell.x * OPTIONS.TILE_SIZE, y: cell.y * OPTIONS.TILE_SIZE};
    }

    return InventoryItem;
})