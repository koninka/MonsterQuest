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
            "HEAD" ,
            "NECK" ,
            "BODY" ,
            "HANDS",
            "LEFT" ,
            "RIGHT" ,
            "WEAPON",
            "ARM" ,
            "FEET" 

        ]
        if(cell.x >= -1 && cell.x < 0 && cell.y >= 0 && cell.y < OPTIONS.slots.length)
            //return OPTIONS.slots[cell.y];
            return itemType[cell.y]
        return null;
    }

    function CoordsToPanel(coords){
        var panel = GLOBAL.game.quickpanel.position;
        var size  = OPTIONS.quickpanel.size;
        var x_l = panel.x;
        var y_t = panel.y;
        var y_b = y_t + OPTIONS.TILE_SIZE;
        var x_r = x_l + OPTIONS.TILE_SIZE * size;
        if(coords.y >= y_t && coords.y < y_b && coords.x >= x_l && coords.x < x_r){
            return Math.floor((coords.x - x_l) / OPTIONS.TILE_SIZE);
        }
        return null;
    }

    function InventoryItem(item){
        Item.call(this, item);
        var m = this.item;
        var I = this;
        this.onDoubleClick = function(data){
            m.qiuckAction();
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
            GLOBAL.game.SelfExamine();
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
            var qp_numb = CoordsToPanel(data.global)
            if(number !== null){
                GLOBAL.game.sendViaWS({action: "unequip", id: m.id});
                GLOBAL.game.sendViaWS({action: "moveItem", id: m.id, cell: number});
            } else if(slot !== null){
                GLOBAL.game.sendViaWS({action: "equip", id: m.id, slot: slot});
            } else if(qp_numb !== null){
                GLOBAL.game.quickpanel.SetToPanel(m, qp_numb);
            }
            GLOBAL.game.SelfExamine();
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

    function IsArmor(item){
        var a = [
            "amulet",
            "ring" ,
            "armor",
            "shield",
            "helmet",
            "gloves",
            "boots",
            "weapon",
        ]
        return item.IndexOf(item.itemType) != -1;
    }

    function UseOnTarget(item){
        var a = ['scroll'];
        return item.IndexOf(item.itemType) != -1;
    }

    InventoryItem.prototype.qiuckAction = function(){
        if(IsArmor(this.item)){
            var s = GLOBAL.game.inventory.FindSlot(this);
            GLOBAL.game.sendViaWS({action: "equip", id: this.item.id, slot: s});
        } else if(UseOnTarget(item)){
            GLOBAL.game.inventory.Hide();
            GLOBAL.use_mode = {
                action : "use",
                id : this.item.id
            };
        } else {
            GLOBAL.game.sendViaWS({action: "use", id: this.item.id })
        }
    }

    return InventoryItem;
})