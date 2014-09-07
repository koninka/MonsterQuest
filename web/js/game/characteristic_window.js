define(['global', 'options', 'count_label', 'button', 'sliderbar'], function(GLOBAL, OPTIONS, CountLabel, Button, SliderBar){
    var max_x = 0;
    function CharacteristicWindow(char_list){
        PIXI.DisplayObjectContainer.call(this);
        this.background_layer      = new PIXI.DisplayObjectContainer();
        this.characteristics_layer = new PIXI.DisplayObjectContainer();
        this.counter_layer         = new PIXI.DisplayObjectContainer();
        this.addChild(this.background_layer);
        this.addChild(this.characteristics_layer);
        this.addChild(this.counter_layer);
        this.close_button = new Button('minimize_btn');
        
        var I = this;
        this.close_button.onClick = function(){
            I.Hide();
        }
        this.addChild(this.close_button);
        GLOBAL.graphic.stage.addChild(this);
        this.characteristics_layer.characteristics = {};
        this.free_points = 0;
        this.InitBackground();
        this.InitCharacteristics(char_list);
        this.position = OPTIONS.chrwind.position;
        this.Hide();
    }

    CharacteristicWindow.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    CharacteristicWindow.prototype.constructor = CharacteristicWindow;

    CharacteristicWindow.prototype.Show = function(){
        this.visible = true;
    }

    CharacteristicWindow.prototype.Hide = function(){
        this.visible = false;
    }

    CharacteristicWindow.prototype.Toggle = function(){
        this.visible = !this.visible;
    }

    CharacteristicWindow.prototype.HideAddButtons = function(){
        this.add_buttons_layer.visible = false;
    }

    CharacteristicWindow.prototype.ShowAddButtons = function(){
        this.add_buttons_layer.visible = true;
    }

    CharacteristicWindow.prototype.AddToBackground = function(name, x, y){
        return GLOBAL.graphic.AddSpriteToLayer(name, this.background_layer, x, y);
    }

    CharacteristicWindow.prototype.InitBackground = function() {
        var top = this.AddToBackground('characteristics_window_top', 0, 0);
        var middle = this.AddToBackground('characteristics_window_middle',  1, top.height);
        var bottom = this.AddToBackground('characteristics_window_bottom',  0, top.height + middle.height);
        this.close_button.position.x = top.width - this.close_button.width;
    };

    function CorrectPosition(layer, x){
        if (layer.position.x < x)
            layer.position.x = x;
    }

    CharacteristicWindow.prototype.AddCharacteristic = function(name, count, x, y){
        var t = this.characteristics_layer.characteristics[name] = GLOBAL.graphic.Text(
            name + ' : ', 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white', wordWrap : true, wordWrapWidth : 200},
            0, 
            0
        );
        GLOBAL.graphic.AddObjToLayer(t, this.characteristics_layer, x, y);
        x += t.width;
        t.counter = new CountLabel();
        t.counter.SetCount(count);
        t.counter.Show();
        GLOBAL.graphic.AddObjToLayer(t.counter, this.counter_layer, 0, y);
        CorrectPosition(this.counter_layer, x);
        return t;
    }

    CharacteristicWindow.prototype.InitCharacteristics = function(char_list){
        var x = OPTIONS.chrwind.start.x;
        var y = OPTIONS.chrwind.start.y;
        for(var c in char_list){
            y += OPTIONS.chrwind.offset;
            this.AddCharacteristic(c, char_list[c], x, y);
        }
    }

    CharacteristicWindow.prototype.UpdateCount = function(char_list){
        for(var c in char_list){
            var counter = this.characteristics_layer.characteristics[c].counter;
            counter.SetCount(char_list[c]);
            counter.Show();
        }
    }


    return CharacteristicWindow;
})