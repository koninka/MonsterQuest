define(['options', 'global', 'count_label'], function(OPTIONS, GLOBAL, CountLabel){
    
    var TS = OPTIONS.TILE_SIZE;
    var block_width = 0;
    var connector_width = 0;
    var counter_offset = 5;

    function XPBar(cur, max){
        PIXI.DisplayObjectContainer.call(this);
        this.line_layer      = new PIXI.Graphics(0, 0);
        this.block_layer     = new PIXI.DisplayObjectContainer();
        this.connector_layer = new PIXI.DisplayObjectContainer();
        this.counter_layer   = new PIXI.DisplayObjectContainer();
        this.addChild(this.line_layer);
        this.addChild(this.block_layer);
        this.addChild(this.connector_layer);
        this.addChild(this.counter_layer);
        GLOBAL.graphic.stage.addChild(this);
        var block = GLOBAL.graphic.Sprite('xpbar_block');
        block_width = block.width;
        this.position.y = GLOBAL.graphic.height - TS - block.height;
        this.position.x = GLOBAL.graphic.width / 2 - OPTIONS.xpbar.size / 2 * block.width;
        this.xpbar_width = block.width * OPTIONS.xpbar.size;
        this.xpbar_height = block.height;
        var connector = GLOBAL.graphic.Sprite('xpbar_connector');
        connector_width = connector.width;
        this.InitBlocks();
        this.InitCounter();
        this.SetXP(cur, max);
        this.SetInteractivity();
    }

    XPBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    XPBar.prototype.constructor = XPBar;

    XPBar.prototype.SetInteractivity = function(){
        this.interactive = true;
        this.mouseover = function(data){
            this.counter_layer.visible = true;
        }
        this.mouseout = function(data){
            this.counter_layer.visible = false;
        }
    }

    XPBar.prototype.InitCounter = function(){
        var l = this.counter_layer.min = new CountLabel();
        var h = this.counter_layer.max = new CountLabel();
        l.font = h.font = '10px Halvetica';
        l.auto_hide = h.auto_hide = false;
        this.counter_layer.addChild(this.counter_layer.min);
        this.counter_layer.addChild(this.counter_layer.max);
        this.counter_layer.visible = false;
        this.counter_layer.position.y = 4;
        l.position.x = counter_offset;
        //this.counter_layer.max.position.x = this.xpbar_width;
    }

    XPBar.prototype.AddBlock = function(x, y){
        GLOBAL.graphic.AddSpriteToLayer('xpbar_block', this.block_layer, x, y);
    }

    XPBar.prototype.AddConnector = function(x, y){
        GLOBAL.graphic.AddSpriteToLayer('xpbar_connector', this.connector_layer, x - connector_width / 2, y);
    }

    XPBar.prototype.InitBlocks = function(){
        for(var i = 0; i < OPTIONS.xpbar.size; ++i){
            var x = block_width * i;
            if (x != 0)
                this.AddConnector(x, 0);
            this.AddBlock(x, 0);
        }
    }

    XPBar.prototype.SetXP = function(cur, max){
        this.cur_xp = cur;
        this.max_xp = max;
        if(this.cur_xp < 0){
            this.cur_xp = 0;
        }
        this.line_layer.clear();
        this.line_layer.beginFill(0xA6068C);
        var c = OPTIONS.xpbar.offset;
        this.line_layer.drawRect(
            c, 3, this.cur_xp / this.max_xp * (this.xpbar_width - 2 * c), OPTIONS.xpbar.height_of_color_line
        );
        this.counter_layer.min.SetCount(cur);
        this.counter_layer.max.SetCount(max);
        this.counter_layer.max.position.x = this.xpbar_width - this.counter_layer.max.width - counter_offset;
    }
    return XPBar;
})