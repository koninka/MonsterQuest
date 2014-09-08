define(['global', 'options'], function(GLOBAL, OPTIONS){ 
    function CountLabel(){
        PIXI.DisplayObjectContainer.call(this);
        this.auto_hide = true;
        //this.SetCount(count);
    }
    
    CountLabel.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    CountLabel.prototype.constructor = CountLabel;
    
    CountLabel.prototype.SetCount = function(count){
        if (this.count == count) return;
        this.count = count;
        if(this.draw)
            this.removeChild(this.draw);
        if(this.count == undefined)
            this.count = 1;
        this.draw = GLOBAL.graphic.Text(
            this.count, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white', wordWrap : true, wordWrapWidth : 200},
            0, 
            0
        );
        this.draw.position = {x : 0, y : 0}
        this.addChild(this.draw);
        if (this.auto_hide)
            if(this.count < 2)
                this.Hide()
            else
                this.Show();
    }
    
    CountLabel.prototype.Show = function(){
        this.visible = true;
    }
    
    CountLabel.prototype.Hide = function(){
        this.visible = false;
    }

    return CountLabel;
});