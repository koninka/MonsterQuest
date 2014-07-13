
define(["global", "options"], function(GLOBAL, OPTIONS){

    function Text(text){
        return GLOBAL.graphic.Text(
            text, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white', wordWrap : true, wordWrapWidth : 200},
            0, 
            0
        );
    }

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

    function TrackBar(){
        PIXI.DisplayObjectContainer.call(this);
        var I = this;
        this.AddToScreen();
        this.cur = 0;
        this.low = 0;
        this.high = 0;
        var bar = this.bar = GLOBAL.graphic.Sprite('trackbar_bar');
        var background = GLOBAL.graphic.Sprite('trackbar_background');
        var slider = this.slider = GLOBAL.graphic.Sprite('trackbar_slider');
        var exit = GLOBAL.graphic.Sprite('trackbar_exit');
        var ok = this.ok = GLOBAL.graphic.Sprite('trackbar_ok');
        this.addChild(background);
        background.addChild(bar);
        background.addChild(exit);
        background.addChild(ok);
        bar.position = OPTIONS.trackbar.bar_position;
        bar.addChild(slider);

        slider.anchor.x = 0.5;
        slider.anchor.y = 0.5; 
        slider.position.y += bar.height / 2;
        slider.interactive = true;
        slider.mousedown = StartDrag;
        slider.mousemove = function(data){
            if(this.dragging){
                var x = this.data.getLocalPosition(this.parent).x;
                if(x < 0)
                    x = 0;
                if(x > this.parent.width)
                    x = this.parent.width;
                this.position.x = x;
                I.SetCur(Math.floor(x * (I.high - I.low) / bar.width));
            }
        }
        slider.mouseup = slider.mouseupoutside = StopDrag;
        exit.anchor.x = exit.anchor.y = 0.5;
        exit.position.x = background.width - 10;
        exit.position.y = 5;
        exit.interactive = true;
        exit.click = function(){
            I.Hide();
        }

        ok.anchor.x = 0.5;
        ok.anchor.y = 1;
        ok.position.x = background.width / 2;
        ok.position.y = background.height - 5;
        ok.interactive = true;

    }

    TrackBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    TrackBar.prototype.constructor = TrackBar;

    TrackBar.prototype.Show = function(){
        this.visible = true;
    }

    TrackBar.prototype.Hide = function(){
        this.visible = false;
    }

    TrackBar.prototype.SetHigh = function(high){
        this.high = high;
        if(this.high_text)
            this.removeChild(this.high_text);
        var text = this.high_text = Text(high);
        var bp = this.bar.position;
        text.anchor.x = 1;
        text.anchor.y = 1;
        text.position.x = bp.x + this.bar.width;
        text.position.y = bp.y
        this.addChild(this.high_text);
    }

    TrackBar.prototype.SetLow = function(low) {
        this.low = low;
        if(this.low_text)
            this.removeChild(this.low_text);
        var text = this.low_text = Text(low);
        var bp = this.bar.position;
        text.anchor.y = 1;
        text.position.x = bp.x;
        text.position.y = bp.y
        this.addChild(this.low_text);
    }

    TrackBar.prototype.SetData = function(data){
        var I = this;
        this.ok.click = function(){
            data.amount = I.cur;
            GLOBAL.game.sendViaWS(data);
            I.Hide();
            GLOBAL.game.SelfExamine();
        }
    }

    TrackBar.prototype.SetCur = function(cur){
        this.cur = cur;
        if(this.cur_text)
            this.removeChild(this.cur_text);
        var text = this.cur_text = Text(cur);
        var bp = this.bar.position;
        text.anchor.x = 0.5;
        text.anchor.y = 1;
        text.position.x = bp.x + this.bar.width / 2;
        text.position.y = bp.y
        this.addChild(this.cur_text);
    }

    TrackBar.prototype.SetSlider = function(cur){
        this.slider.position.x = cur * this.bar.width / (this.high - this.low);
    }

    TrackBar.prototype.SetAndShow = function(low, high, data){
        this.cur = 0;
        this.SetHigh(high);
        this.SetLow(low);
        this.SetCur(0);
        this.SetSlider(this.cur);
        this.SetData(data);
        this.Show();
    }

    TrackBar.prototype.AddToScreen = function(){
        GLOBAL.graphic.stage.addChild(this);
        this.Hide();
        this.position = OPTIONS.trackbar.position;
    }

    return TrackBar;
})


