define(['global', 'inventory_item', 'options'], function(GLOBAL, IItem, OPTIONS){
    /* cells 20 * 10 */
    var inventory_size = OPTIONS.inventory_size;
    var TS = OPTIONS.TILE_SIZE;
    function Inventory(fistId){
        this.items = [];
        this.InitContainer();
        this.slots = {
            "head" : null,
            "neck" : null,
            "body" : null,
            "forearm" : null,
            "left-finger" : null,
            "right-finger" : null,
            "left-hand" : null,
            "right-hand" : null,
            "feet" : null,
            "ammo" : null
        };
        this.weapon_id = [];
        this.fistId = fistId;
        var I = this;
        GLOBAL.graphic.field.click = function(){
            var point = GLOBAL.graphic.PointerToGameCoords();
            if(GLOBAL.use_mode){
                GLOBAL.use_mode.x = point.x;
                GLOBAL.use_mode.y = point.y;
                GLOBAL.game.sendViaWS(GLOBAL.use_mode);
                GLOBAL.use_mode = null;
            } else {
                for(var i = 0; i < I.weapon_id.length; ++i){
                    var id = I.weapon_id[i];
                    GLOBAL.game.sendViaWS({action: "use", id: id, x: point.x, y: point.y});
                }
            }
        }
    }

    Inventory.prototype.constructor = Inventory;

    Inventory.prototype.InitCells = function(){
        for(var i = 0; i < inventory_size.x; ++i){
            var x = TS * i;
            for(var j = 0; j < inventory_size.y; ++j){
                var y = TS * j;
                this.AddCell('inventory_cell', x, y);
            }
        }
    }

    Inventory.prototype.AddCell = function(img, x, y){
        var cell = GLOBAL.graphic.Sprite(img);
        cell.position.x = x;
        cell.position.y = y;
        this.drawable.addChild(cell);
        return cell;
    }

    Inventory.prototype.InitSlots = function(){
        var x = -TS;
        var y = 0;
        
        for(var j = 0; j < OPTIONS.slots.length; ++j){
            var y = TS * j;
            this.AddCell(OPTIONS.slots[j], x, y);
        }
    }

    Inventory.prototype.InitContainer = function() {
        this.drawable = new PIXI.DisplayObjectContainer();
        this.Hide();
        GLOBAL.graphic.stage.addChild(this.drawable);
        this.drawable.position.x = 200;
        this.drawable.position.y = 200;
        this.InitCells();
        this.InitSlots();

    };

    Inventory.prototype.AddItem = function(item){
        var i = this.items[item.id] = new IItem(item);
        this.drawable.addChild(i.drawable);
    }

    Inventory.prototype.RemoveItem = function(item){
        var i = this.items[item.id];
        this.drawable.removeChild(i.drawable);
        delete this.items[item.id];
    }

    var slotToNumber = {
        "head" : 0,
        "neck" : 1,
        "body" : 2,
        "forearm" : 3,
        "left-finger" : 4,
        "right-finger" : 5,
        "left-hand" : 6,
        "right-hand" : 7,
        "feet" : 8,
        "ammo" : 9
    }    

    Inventory.prototype.FindSlot = function(item){
        var itemType = {
            "amulet" : ["neck"],
            "ring" : ["left-finger", "right-finger"],
            "armor" : ["body"],
            "shield" : ["right-hand"],
            "helmet" : ["head"],
            "gloves" : ["forearm"],
            "boots" : ["feet"],
            "weapon" : ["left-hand"]
        }
        var slot = itemType[item.itemType];
        if(!slot)
            return null;
        for(var s = 0; s < slot.length; ++s){
            if(this.slots[slot[s]] == null){
                return slot[s];
            }
        }
        return slot[0];
    }

    Inventory.prototype.SetItems = function(items, slots){
        if(!items) return;
        this.slots = {
            "head" : null,
            "neck" : null,
            "body" : null,
            "forearm" : null,
            "left-finger" : null,
            "right-finger" : null,
            "left-hand" : null,
            "right-hand" : null,
            "feet" : null,
            "ammo" : null
        };
        var founded_items = {};
        var cell_x = 0;
        var cell_y = -1;
        var slt_id = {};
        this.weapon_id = [];
        
        if(slots)
        for(var s in slots){
            var x = -1;
            var y = slotToNumber[s];
            var id = slots[s].id;
            //this.slots[s] = true;
            if(!this.items[id])
                this.AddItem(slots[s]);
            this.slots[s] = this.items[id];
            this.items[id].SetPosition({x: x, y: y});
            this.items[id].slot = s;
            this.items[id].SetCount(slots[s].amount);
            founded_items[id] = true;
        }
        for(var i = 0; i < items.length; ++i){
            if(i % inventory_size.x == 0){
                cell_x = 0;
                cell_y++;
            } else {
                cell_x++;
            }
            var item = items[i];
            var id = item.id;
            if(!this.items[id]){
                this.AddItem(item)
            }
            var x = cell_x;
            var y = cell_y;
            if(item.cell !== null){
                y = Math.floor(item.cell / inventory_size.x);
                x = item.cell % inventory_size.x;
            }
            this.items[id].SetPosition({x: x, y: y});    
            this.items[id].slot = undefined;
            this.items[id].SetCount(item.amount);
            founded_items[id] = true;
        }
        for(var i in this.items){
            if(!founded_items[i]){
                this.RemoveItem(this.items[i].item);
            }
        }
        var left = this.slots["left-hand"];
        var right = this.slots["right-hand"];
        if(left && left.item.itemType == "weapon")
            this.weapon_id.push(left.id);
        if(right && right.item.itemType == "weapon")
            this.weapon_id.push(right.id);
        if(this.weapon_id.length == 0)
            this.weapon_id.push(this.fistId);
        
    }

    Inventory.prototype.Show = function(){
        this.drawable.visible = true;
    }

    Inventory.prototype.Hide = function(){
        this.drawable.visible = false;
    }

    Inventory.prototype.Toggle = function(){
        this.drawable.visible = !(this.drawable.visible);
    }

    return Inventory;
})