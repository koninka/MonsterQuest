define(['options', 'global'], function(OPTIONS, GLOBAL){
    var qp_options = OPTIONS.quickpanel;
    var TS = OPTIONS.TILE_SIZE;

    function QuickPanel(){
        PIXI.DisplayObjectContainer.call(this);
        GLOBAL.graphic.stage.addChild(this);
        this.position.y = GLOBAL.graphic.height - TS;
        this.position.x = GLOBAL.graphic.width / 2 - qp_options.size / 2 * TS;
        this.InitCells();
        this.onPanel = {};
    }

    QuickPanel.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    QuickPanel.prototype.constructor = QuickPanel;

    QuickPanel.prototype.AddCell = function(img, x, y){
        var cell = GLOBAL.graphic.Sprite(img);
        cell.position.x = x;
        cell.position.y = y;
        this.addChild(cell);
        return cell;
    }

    QuickPanel.prototype.InitCells = function(){
        for(var i = 0; i < qp_options.size; ++i){
            var x = TS * i;
            this.AddCell('inventory_cell', x, 0);
        }
    }

    function QuickButton(something, number){
        var textures = GLOBAL.graphic.textures;
        var t = textures[something.name] || teuxtures[something.type];
        PIXI.Sprite.call(this, t);
        this.link = something;
        this.interactive = true;
        this.click = function(data){
            this.link.quickAction();
        }
        this.position.y = 0;
        this.position.x = TS * number;
    }

    QuickButton.prototype = Object.create(PIXI.Sprite.prototype);
    QuickButton.prototype.constructor = QuickButton;


    QuickPanel.prototype.SetToPanel = function(something, number){
        if(this.onPanel[number]){
            KeyboardJS.clear((number + 1).toString());
            this.removeChild(this.onPanel[number]);
        }
        var link = new QuickButton(something, number);
        this.onPanel[number] = link;
        this.addChild(link);
        KeyboardJS.on((number + 1).toString(), function(){
            link.click();
        })
    }

    return QuickPanel;
})