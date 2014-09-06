define(['options', 'global'], function(OPTIONS, GLOBAL){
    
    var TS = OPTIONS.TILE_SIZE;
    var block_width = 0;
    var connector_width = 0;

    function XPBar(cur, max){
        PIXI.DisplayObjectContainer.call(this);
        this.line_layer = new PIXI.Graphics(0, 0);
        this.block_layer = new PIXI.DisplayObjectContainer();
        this.connector_layer = new PIXI.DisplayObjectContainer();
        this.addChild(this.line_layer);
        this.addChild(this.block_layer);
        this.addChild(this.connector_layer);
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
        this.SetXP(cur, max);
    }

    XPBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    XPBar.prototype.constructor = XPBar;

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
        this.cur_xp = cur || 300;
        this.max_xp = max || 1000;
        if(this.cur_xp < 0){
            this.cur_xp = 0;
        }
        this.line_layer.clear();
        this.line_layer.beginFill(0xFFFF00);
        var c = OPTIONS.xpbar.offset;
        this.line_layer.drawRect(
            c, 3, this.cur_xp / this.max_xp * (this.xpbar_width - 2 * c), OPTIONS.xpbar.height_of_color_line
        );
    }
    return XPBar;
})