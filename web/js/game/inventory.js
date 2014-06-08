define(['global', 'inventory_item', 'options'], function(GLOBAL, IItem, OPTIONS){
    /* cells 20 * 10 */
    var inventory_size = OPTIONS.inventory_size;
    var TS = OPTIONS.TILE_SIZE;
    function Inventory(screen){
        this.items = [];
        this.InitContainer();
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
/*case consts.ITEM_T_AMULET:
            return "amulet"
        case consts.ITEM_T_RING:
            return "ring"
        case consts.ITEM_T_ARMOR:
            return "armor"
        case consts.ITEM_T_SHIELD:
            return "shield"
        case consts.ITEM_T_HELMET:
            return "helmet"
        case consts.ITEM_T_GLOVES:
            return "gloves"
        case consts.ITEM_T_BOOTS:
            return "boots"
        case consts.ITEM_T_WEAPON:
            return "weapon"
        case consts.ITEM_T_POTION:
            return "potion"
        case consts.ITEM_T_S*/
   // function ItemToSlot(item){
    //    var n = 0;
        var itemType = {
            "HEAD" : 0,
            "NECK" : 1,
            "BODY" : 2,
            "HANDS" : 3,
            "LEFT" : 4,
            "RIGHT" : 5,
            "WEAPON" : 6,
            "ARM" : 7,
            "FEET" : 8
        }
   // }

    Inventory.prototype.SetItems = function(items, slots){
        if(!items) return;
        var founded_items = {};
        var cell_x = 0;
        var cell_y = -1;
        var slt_id = {};
        if(slots)
        for(var s = 0; s < slots.length; ++s){
            slt_id[slots[s]] = true;
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
            if(slt_id[id]){
                item.cell = -1;
            }
            if(this.items[id]){
                var x = cell_x;
                var y = cell_y;
                if(item.cell !== null){
                    if(item.cell == -1){
                        x = -1;
                        y = itemType[item.itemType];
                    } else {
                        y = Math.floor(item.cell / inventory_size.x);
                        x = item.cell % inventory_size.x;
                    }
                }
                this.items[id].SetPosition({x: x, y: y});
            } else {
                this.AddItem(item);
            }
            founded_items[id] = true;
        }
        for(var i in this.items){
            if(!founded_items[i]){
                this.RemoveItem(this.items[i].item);
            }
        }
    }

    Inventory.prototype.MakeChanges = function(){
        
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