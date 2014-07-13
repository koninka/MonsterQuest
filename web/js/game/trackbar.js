
define(["global", "options"], function(GLOBAL, OPTIONS){

    function SliderMouseDown(data){
        data.originalEvent.preventDefault();
        this.data = data;
        this.dragging = true;
    }

    function SliderMouseMove(data){
        if(this.dragging){
            var x = this.data.getLocalPosition(this.parent).x;
            if(x < 0)
                x = 0;
            if(x > this.parent.width)
                x = this.parent.width;
            this.position.x = x;
            //this.position.y = newPosition.y;
        }
    }

    function SliderMouseUp(data){
        //if(!this.dragging) return;
        this.dragging = false;
        this.data = null;
    }

    function TrackBar(){
        PIXI.DisplayObjectContainer.call(this);
        var I = this;
        this.Init();
        this.cur = 0;
        this.low = 0;
        this.high = 0;
        var bar = GLOBAL.graphic.Sprite('trackbar_bar');
        var background = GLOBAL.graphic.Sprite('trackbar_background');
        var slider = GLOBAL.graphic.Sprite('trackbar_slider');
        var exit = GLOBAL.graphic.Sprite('trackbar_exit');
        this.addChild(background);
        background.addChild(bar);
        background.addChild(exit);
        bar.position = OPTIONS.trackbar.bar_position;
        bar.addChild(slider);

        slider.anchor.x = 0.5;
        slider.anchor.y = 0.5; 
        slider.position.y += bar.height / 2;
        slider.interactive = true;
        slider.mousedown = SliderMouseDown;
        slider.mousemove = SliderMouseMove;
        slider.mouseup = slider.mouseupoutside = SliderMouseUp;

        exit.anchor.x = exit.anchor.y = 0.5;
        exit.position.x = background.width - 5;
        exit.position.y = 5;
        exit.interactive = true;
        exit.click = function(){
            I.Hide();
        }

        //this.bar.onmousemove = function(){
        //    I.cur = (high_pix - low_pix) / I.high * cur_pix;
        //}
        //this.button = new PIXI.Sprite('button');
        //this.addChild(this.slider);
        //this.addChild(this.bar);
        //this.addChild(this.button);
        //this.high_text;
        //this.low_text;
    }

    TrackBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    TrackBar.prototype.constructor = TrackBar;

    TrackBar.prototype.Show = function(){
        this.visible = true;
    }

    TrackBar.prototype.Hide = function(){
        this.visible = false;
    }
    //
    //

    TrackBar.prototype.SetHigh = function(high){
        this.high = high;

    }

    TrackBar.prototype.Init = function(){
        GLOBAL.graphic.stage.addChild(this);
        this.Hide();
        this.position = OPTIONS.trackbar.position;
    }

    return TrackBar;
})


