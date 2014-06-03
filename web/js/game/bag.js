define(['global', 'OPTIONS', 'item'], function(GLOBAL, OPTIONS, Item){

    function BagItem(item, number){
        this.item = item;
        this.number = number;
        //Item.call(this, id, type, cell);
        this.InitSprite();
    }

    //BagItem.prototype = Object.create( Item.prototype );
    BagItem.prototype.constructor = BagItem;

    BagItem.prototype.InitSprite = function (){
        var container = new PIXI.DisplayObjectContainer();
        var tile = GLOBAL.graphic.Sprite(this.name);
        tile.anchor.x = 0.5;
        tile.anchor.y = 0.5;
        container.addChild(tile);
        var name = GLOBAL.graphic.Text(
            this.name, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            OPTIONS.TILE_SIZE + 2, 
            0
        )
        container.addChild(name);
        //tile.rotation = this.dir;
        //this.drawable.addChild(tile);
        this.drawable = container;
    }

    function Bag(position, items){
        this.items = items;
        this.drawable = GLOBAL.graphic.Sprite('bag');
        var bag = this;
        this.drawable.click = function(){
            console.log("BAG CLICK!!!!");
            bag.ShowList();
        }
    }

    Bag.prototype.constructor = Bag;

    Bag.prototype.AddItem = function(item){
        this.items.push(item);
    }

    Bag.prototype.RemoveItem = function(item){
        var index = this.items.indexOf( item );
        if(index != -1){
            this.items.splice( index, 1 );
            if(this.list){
                this.UpdateList(index);
            }
        }
        //delete this.items[item.id];
    }

    Bag.prototype.ShowList = function(){
        var list = new PIXI.DisplayObjectContainer();
        for(var i = 0; i < this.items.length; ++i){
            var item = new BagItem(item, i);
            item.drawable.position.x = OPTIONS.TILE_SIZE * i;
            this.drawable.addChild(item.drawable);
        }
    }

    return Bag;
})