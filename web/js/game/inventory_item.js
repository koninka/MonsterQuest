define(['global', 'options', 'item'], function(GLOBAL, OPTIONS, Item){
    function find_slot(item){
        return undefined;
    }

    var TS = OPTIONS.TILE_SIZE;
    function CoordsToCell(coords){
        var cell = {};
        cell.x = Math.floor(coords.x / OPTIONS.TILE_SIZE);
        cell.y = Math.floor(coords.y / OPTIONS.TILE_SIZE);
        return cell;
    }

    function CellToNumber(cell){
        if(cell.x < 0 || cell.y < 0 || cell.x >= OPTIONS.inventory_size.x || cell.y >= OPTIONS.inventory_size.y)
            return null;
        return cell.x + cell.y * OPTIONS.inventory_size.x;
    }

    function CellToSlot(cell){
        var itemType = [
            "helmet",
            "amulet",
            "armor",
            "gloves",
            "ring",
            "ring",
            "weapon",
            "shield",
            "boots"

        ]
        if(cell.x >= -1 && cell.x < 0 && cell.y > 0 && cell.y < OPTIONS.slots.length)
            //return OPTIONS.slots[cell.y];
            return itemType[cell.y]
        return null;
    }

    function InventoryItem(item){
        Item.call(this, item);
        var m = this.item;
        var I = this;
        this.onDoubleClick = function(data){
            data.originalEvent.preventDefault();
            if(m.equiped){
                GLOBAL.game.sendViaWS({action: "unequip", id: m.id});
            }else{
                GLOBAL.game.sendViaWS({action: "equip", id: m.id, slot: m.itemType});
            }
        }
        this.onClick = function(data){}
        this.onRightClick = function(data){
            data.originalEvent.preventDefault();
            var keys = KeyboardJS.activeKeys();
            if(keys[0] == 'shift')
                GLOBAL.game.sendViaWS({action: "drop", id: m.id});
            else if(keys[0] == 'ctrl')
                GLOBAL.game.sendViaWS({action: "destroyItem", id: m.id});
            else
                GLOBAL.game.sendViaWS({action: "examine", id: m.id});
        }
        this.drawable.mousedown = function(data){
            var event = data.originalEvent;
            if(event.which == 3 || event.button == 2)
                return;
            //event.preventDefault();
            this.data = data;
            this.alpha = 0.9;
            this.dragging = true;
        }

        this.drawable.mouseup = this.drawable.mouseupoutside = function(data){
            if(!this.dragging) return;
            this.alpha = 1;
            this.dragging = false;
            //var newPosition = this.data.getLocalPosition(this.parent);
            this.data = null;
            var cell = CoordsToCell(this.position);
            var number = CellToNumber(cell);
            var slot = CellToSlot(cell);
            if(number !== null){
                GLOBAL.game.sendViaWS({action: "moveItem", id: m.id, cell: number});
                GLOBAL.game.sendViaWS({action: "examine", id: GLOBAL.game.player.id});
            } else if(slot !== null){
                GLOBAL.game.sendViaWS({action: "equip", id: m.id, slot: slot});
                GLOBAL.game.sendViaWS({action: "examine", id: GLOBAL.game.player.id});
            }
            data.originalEvent.preventDefault();
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