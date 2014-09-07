define(['global', 'options'], function(GLOBAL, OPTIONS){

    function StartDrag(data){
        data.originalEvent.preventDefault();
        this.data = data;
        this.dragging = true;
    }

    function Drag(data){
        if(!this.dragging) return
        this.position = this.data.getLocalPosition(this.parent);
    }

    function StopDrag(data){
        //if(!this.dragging) return;
        this.dragging = false;
        this.data = null;
    }

    function SliderBar(size){
        PIXI.DisplayObjectContainer.call(this);
        this.border_layer  = new PIXI.DisplayObjectContainer();
        var slider = this.slider_button = GLOBAL.graphic.Sprite('slider_button');
        this.addChild(this.border_layer);
        var I = this;
        slider.interactive = true;
        slider.mousedown = StartDrag;
        slider.mousemove = function(data){
            if(this.dragging){
                var y = this.data.getLocalPosition(this.parent).y;
                if(y < 0)
                    y = 0;
                if(y > I.border_layer.length)
                    y = I.border_layer.length;
                this.position.y = y;
                if (I.onDrag) I.onDrag({cur: y, max: I.border_layer.length});
            }
        }
        slider.mouseup = slider.mouseupoutside = StopDrag;

        this.Init(size);
    }
    
    SliderBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    SliderBar.prototype.constructor = SliderBar;

    SliderBar.prototype.AddMid = function(x, y){
        return GLOBAL.graphic.AddSpriteToLayer('slider_border_mid', this.border_layer, x, y);
    };

    SliderBar.prototype.Init = function(size) {
        var x = 0;
        var y = 0;
        var t = GLOBAL.graphic.AddSpriteToLayer('slider_border_top', this, x, y);
        this.border_layer.position.y = t.height;
        while(y < size){
            var s = this.AddMid(x, y);
            y += s.height;
        };
        this.border_layer.length = y - s.height - t.height;
        s = GLOBAL.graphic.AddSpriteToLayer('slider_border_bot', this, x, y);
        y += s.height;
        this.length = y + t.height;
        this.breadth = s.width;
        this.border_layer.addChild(this.slider_button);
    };

    SliderBar.prototype.Hide = function(){
        this.visible = false;
    }
    
    SliderBar.prototype.Show = function(){
        this.visible = true;
    }

    SliderBar.prototype.Toggle = function(){
        this.visible = !this.visible;
    }

    return SliderBar;
})