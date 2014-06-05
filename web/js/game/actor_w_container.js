define(['options', 'global', 'actor'] ,function(OPTIONS, GLOBAL, Actor){

    var hpbar_width = 70;
    var hpbar_height = 2;
    function HpBar(hp, max){
        PIXI.Graphics.call(this, 0, 0);
        this.max = max;
        this.SetHp(hp);
    }

    HpBar.prototype = Object.create(PIXI.Graphics.prototype);
    HpBar.prototype.constructor = HpBar;

    HpBar.prototype.SetHp = function(hp){
        this.hp = hp;
        var hp_to_draw = hp;
        if(hp_to_draw < 0){
            hp_to_draw = 0;
        }
        this.clear();
        this.beginFill(0xFF0000);
        this.drawRect(0, 0, hp_to_draw / this.max * hpbar_width, hpbar_height);
    }

    function ActorWithContainer(id, x, y, type, health, name, initAnimation, player){
        Actor.call(this, id, x, y, type, health, name);
        if(initAnimation === undefined) initAnimation = true;
        this.InitAnimation(initAnimation, player);
    }

    ActorWithContainer.prototype = Object.create(Actor.prototype);
    ActorWithContainer.prototype.constructor = ActorWithContainer;

    ActorWithContainer.prototype.InitAnimation = function(init, player){
        if(!init) return;
        this.Init(player);
        //this.InitBody();
    }

    ActorWithContainer.prototype.Init = function(player){
        this.InitContainer(player);
        this.InitHpBar();
        this.InitName();
    }

    ActorWithContainer.prototype.Hit = function(){
        
    }

    ActorWithContainer.prototype.Attack = function(desc, pt){
        var t = GLOBAL.graphic.textures[desc.blowType];
        if(!t){
            t = GLOBAL.graphic.textures['explosion'];
        }
        var m = new PIXI.MovieClip(t);
        var p = GLOBAL.game.player;
        m.loop = false;
        m.onComplete = function(){
            GLOBAL.graphic.Remove(m);
        }
        GLOBAL.graphic.DrawObj(
            m,
            m.position.x = (pt.x - p.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
            m.position.y = (pt.y - p.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
        )
        m.play();
    }

    ActorWithContainer.prototype.InitName = function(){
        var n = GLOBAL.graphic.Text(
            this.name,
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'black'},
            0, 
            OPTIONS.TILE_SIZE + 7
        )
        n.position.x = (OPTIONS.TILE_SIZE - n.width) / 2 + 2;
        n.visible = false;
        this.container.addChild(n);
        this.container.name = n;
    }

    ActorWithContainer.prototype.SetHP = function(hp){
        Actor.prototype.SetHP.call(this, hp);
        this.container.hpbar.SetHp(hp);
    }

    
    ActorWithContainer.prototype.InitHpBar = function(){
        if(this.health){
            var bar = new HpBar(this.health.cur, this.health.max);
            bar.visible = false;
            bar.position.x = (OPTIONS.TILE_SIZE - hpbar_width) / 2 + 2;
            bar.position.y = OPTIONS.TILE_SIZE + 7;
            this.container.addChild(bar);
            this.container.hpbar = bar;

        }
    }

    ActorWithContainer.prototype.InitContainer = function(player){
        this.container = new PIXI.DisplayObjectContainer(); 
        this.container.interactive = true;
        var m = this;
        this.container.click = function(data){
            var now = Date.now();
            var lc = m.container.click.lastClick;
            var diff = now - lc;
            var event = data.originalEvent;
            if(event.which == 3 || event.button == 2) {
            //this was a right click;
                GLOBAL.game.sendViaWS({action: "examine", id: m.id});
            } else if(lc && (diff < 350)) {
                m.container.click.lastClick = 0;
            //this was a double click
            } else {
                m.container.click.lastClick = now;
            //this was a regular click
            }
        }
        this.container.click.lastClick = 0;
        this.container.mouseover = function(){
            this.name.visible = true;
            this.hpbar.visible = true;
        }
        this.container.mouseout = function(){
            this.name.visible = false;
            this.hpbar.visible = false;
        }
        GLOBAL.graphic.DrawObj(
            this.container,
            this.container.position.x = (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2,
            this.container.position.y = (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2
        )
    }

    ActorWithContainer.prototype.MoveContainer = function(player){
        this.container.position.x = (this.pt.x - player.pt.x) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        this.container.position.y = (this.pt.y - player.pt.y) * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE / 2;
        GLOBAL.graphic.Center(this.container);
    }

    ActorWithContainer.prototype.Move = function(pos, player){
        Actor.prototype.Move.call(this, pos)
        this.MoveContainer(player)
    }

    ActorWithContainer.prototype.Destroy = function(){
        Actor.prototype.Destroy.call(this);
        GLOBAL.graphic.Remove(this.container);
        this.container = undefined;
    }

    return ActorWithContainer;
})