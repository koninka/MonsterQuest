define(['global', 'options'], function(GLOBAL, OPTIONS){
    var UP        = '_UP';
    var DOWN      = '_DOWN';
    var HIGHLIGHT = '_HIGHLIGHT';
    function Button(name){
        var UP_texture   = GLOBAL.graphic.textures[name + UP]   || GLOBAL.graphic.Texture('default_btn_UP');
        var DOWN_texture = GLOBAL.graphic.textures[name + DOWN];
        PIXI.Sprite.call(this, UP_texture);
        //this.name = name;
        this.cur_state = UP;
        //this.buttonMode = true;
        this.interactive = true;
        this.click = function(data){
            if (this.onClick) {
                data.originalEvent.preventDefault();
                this.onClick(data);
            }
        }
        this.mouseupoutside = this.mouseup = function(data){
            this.setTexture(UP_texture);
        }
        this.mousedown = function(data){
            if(DOWN_texture)
                this.setTexture(DOWN_texture);
        }
    }
    Button.prototype = Object.create(PIXI.Sprite.prototype);
    Button.prototype.constructor = Button;
    return Button;
})