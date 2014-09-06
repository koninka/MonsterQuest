define(['jquery', 'options', 'global', 'atlas'], function(JQuery, OPTIONS, global, atlas) {
    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function Graphic(view, game) {
        var I = this;
        this.width = 1000;
        this.height = 600;
        this.textures = {};
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
        this.dict = null;
        this.stage = new PIXI.Stage('0x000000', true);
        this.pointer = {};
        
        $('#view').append(this.renderer.view);
        $('#view').bind('contextmenu', function(){
            return false;
        });
        global.graphic = this;

        //InitField
        this.field = new PIXI.DisplayObjectContainer();
        this.field.interactive = true;
        this.field.mousemove = function(data){
            I.pointer = data.getLocalPosition(this);
            I.pointer.x -= I.width/2;
            I.pointer.y -= I.height/2;
        }
        this.PointerToGameCoords = function(){
            return {
                x: I.pointer.x / OPTIONS.TILE_SIZE + game.player.pt.x,
                y: I.pointer.y / OPTIONS.TILE_SIZE + game.player.pt.y,
            }
        }
        this.stage.addChild(this.field);
        
    }

    function StartAnimate(I){
        var animate = function(){
            stats.begin();
            if(view.player && view.player.container)
                view.player.Rotate();
            I.renderer.render(I.stage);
            requestAnimFrame( animate );
            stats.end();
        }

        requestAnimFrame( animate );  
    }

    Graphic.prototype.LoadTextures = function(onComplete, onProgress) {
        var I = this;
        var count = 0;
        function onImageLoad() {
            count--;
            if (onProgress) onProgress();
            if (!count) {
                StartAnimate(I);
                if (onComplete)
                    onComplete();
            }
        }
        var GetCount = function(a){
            if(a instanceof Array)
                for (var i = 0; i < a.length; ++i)
                    GetCount(a[i]);
            else if(a instanceof Object)
                for(var i in a)
                    GetCount(a[i]);
            else 
                count++;
        }
        var loadA = function(t, a){
            if(a instanceof Array){
                t = [];
                for (var i = 0; i < a.length; ++i)
                    t.push(loadA({}, a[i]))
            } else if(a instanceof Object){
                t = {}
                for(var i in a){
                    t[i] = loadA({}, a[i]);
                }
            } else {
                var loader = new PIXI.ImageLoader(a);
                loader.addEventListener('loaded', onImageLoad);
                loader.load();
                t = loader.texture;
            }
            return t;
        }
        GetCount(atlas);
        I.textures = loadA({}, atlas);
    };

    Graphic.prototype.Texture = function(texture){
        return this.textures[texture] || this.textures['player'];
    }

    Graphic.prototype.Sprite = function(texture){
        return new PIXI.Sprite(this.Texture(texture));
    }

    Graphic.prototype.Center = function(obj){
        obj.position.x += this.width  / 2;
        obj.position.y += this.height / 2;
    }

    Graphic.prototype.DrawObj = function(obj, x, y){
        if(x != undefined)
            obj.position.x = x;
        if(y != undefined)
            obj.position.y = y;
        this.Center(obj);
        this.field.addChild(obj);
        return obj;
    }

    Graphic.prototype.Draw = function(texture, x, y){
        var tile = this.Sprite(texture);
        return this.DrawObj(tile, x, y);
    }

    Graphic.prototype.Clear = function(){
        for (var i = this.field.children.length - 1; i >= 0; i--) {
            this.field.removeChild(this.field.children[i]);
        }
        this.field.children = [];
    }

    Graphic.prototype.Remove = function(sprite){
        this.field.removeChild(sprite)
    }

    Graphic.prototype.drawGroup = function(group, x, y) {
        return this.DrawObj(group, x, y);
    }

    Graphic.prototype.Text = function(text, style, x, y){
        var text = new PIXI.Text(text, style);
        if(x != undefined)
            text.position.x = x;
        if(y != undefined)
            text.position.y = y;
        return text;
    }

    Graphic.prototype.angleToPointer = function(){
        dx = this.pointer.x;
        dy = this.pointer.y;
        return Math.atan2(dy, dx);
    }

    //closed up pixi mem leak
    PIXI.Text.prototype.destroy = function(destroyTexture){
         this.texture.baseTexture.imageUrl = this.canvas._pixiId;
         this.texture.destroy(destroyTexture);
    };

    /*PIXI.DisplayObjectContainer.prototype.removeChild = function(child){
        if(this.stage)child.removeStageReference();
        child.parent = undefined;
    };*/

    PIXI.DisplayObjectContainer.prototype.removeStageReference = function(){
        if (this.destroy)this.destroy(true);  //

        for(var i=0,j=this.children.length; i<j; i++){
          var child = this.children[i];
          child.removeStageReference();
        }

        if(this._interactive)this.stage.dirty = true;

        this.stage = null;
    };

    // https://github.com/GoodBoyDigital/pixi.js/pull/647
    return Graphic;
});