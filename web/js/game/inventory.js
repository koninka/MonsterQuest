define(['global', 'inventory_item', 'options'], function(GLOBAL, IItem, OPTIONS){
    /* cells 20 * 10 */
    var inventory_size = {x: 20, y: 10};
    function Inventory(screen){
        this.items = [];
        this.InitContainer();
    }

    Inventory.prototype.constructor = Inventory;


    Inventory.prototype.InitContainer = function() {
        this.drawable = new PIXI.DisplayObjectContainer();
        this.Hide();
        GLOBAL.graphic.stage.addChild(this.drawable);
        this.drawable.position.x = 200;
        this.drawable.position.y = 200;

        var TS = OPTIONS.TILE_SIZE;
        for(var i = 0; i < inventory_size.x; ++i){
            var x = TS * i;
            for(var j = 0; j < inventory_size.y; ++j){
                var y = TS * j;
                var cell = GLOBAL.graphic.Sprite('inventory_cell');
                cell.position.x = x;
                cell.position.y = y;
                this.drawable.addChild(cell);
            }
        }
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

    Inventory.prototype.SetItems = function(items){
        if(!items) return;
        var founded_items = {};
        var cell_x = 0;
        var cell_y = -1;
        for(var i = 0; i < items.length; ++i){
            if(i % inventory_size.x == 0){
                cell_x = 0;
                cell_y++;
            } else {
                cell_x++;
            }
            var item = items[i];
            var id = item.id;
            if(this.items[id]){
                this.items[id].SetPosition({x: cell_x, y: cell_y});
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