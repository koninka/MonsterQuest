define(['options', 'global', 'actor_info', 'animation_manager', 'item', 'projectile'], function(OPTIONS, GLOBAL, actorInfo, AnimationManager, Item, Projectile) {
    var TILE_SIZE = 32;
    var graphic = null;

    function Background(){
        this._data = [
            ['.', '.','.','.','.'],
            ['.', '.','.','.','.'],
            ['.', '.','.','.','.'],
            ['.', '.','.','.','.'],
            ['.', '.','.','.','.'],
            ['.', '.','.','.','.']
        ]   // map from look
        this.dictionary = {'.':'grass', '#':'wall'};
        this.map = []
    }

    Background.prototype.SetMap = function(map, pt){
        var TS = OPTIONS.TILE_SIZE;
        var off_x = OPTIONS.screenColumnCount / 2 - 1;
        var off_y = OPTIONS.screenRowCount    / 2 - 1;
        var y = (-pt.y % 1 - off_y) * TS;
        for(var i = 0; i < map.length; ++i){
            var x = (-pt.x % 1 - off_x) * TS;
            for(var j = 0; j < map[i].length; ++j){
                if(this._data[i][j] != map[i][j]){
                    this.map[i][j].setTexture(graphic.Texture(this.dictionary[map[i][j]]));
                }
                this.map[i][j].position.x = x;
                this.map[i][j].position.y = y;
                graphic.Center(this.map[i][j]);
                x += TS;
            }
            y += TS;
        }
        this._data = map;
    }

    Background.prototype.DefineMap = function(map){
        this.map = [];
        for(var i = 0; i < map.length; ++i){
            this.map.push([])
            for(var j = 0; j < map[i].length; ++j){
                var tile = graphic.Draw(this.dictionary[map[i][j]], 0, 0, graphic.field.background_layer);
                tile.anchor.x = 0.5;
                tile.anchor.y = 0.5;
                this.map[i].push(tile);
            }
        }
        this._data = map;
    }

    function Examine(){
        PIXI.DisplayObjectContainer.call(this);
        this.txt = '';
        this.visible = false;
        this._text = null;
        this.bonuses = [];
    }

    Examine.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
    Examine.prototype.constructor = Examine;

    Examine.prototype.Bonus = function(bonus, color){
        var txt = "";
        txt += bonus.characteristic + " : " + bonus.val + (bonus.persent ? "%" : "");
        var b = graphic.Text(
            txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: color || (bonus.val > 0 ? 'green' : 'red')},
            0, 
            OPTIONS.TILE_SIZE + 7
        );
        this.bonuses.push(b);
        this.addChild(b);
        return b;
    }

    Examine.prototype.ClearBonuses = function(){
       for(var b = 0; b < this.bonuses.length; ++b){
            this.removeChild(this.bonuses[b]);
        }
        this.bonuses = []; 
    }

    Examine.prototype.SetBonuses = function(txt, bonuses, y0){
        var y = y0;
        var b = graphic.Text(
            txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            0, 
            OPTIONS.TILE_SIZE + 7
        );
        b.position.x = 20;
        b.position.y = y;
        y += b.height;
        this.bonuses.push(b);
        this.addChild(b);
        for(var b = 0; b < bonuses.length; ++b){
            var bonus = this.Bonus(bonuses[b]);
            bonus.position.y = y;
            bonus.position.x = 20;
            y += bonus.height;
        }
        return y;
    }

    Examine.prototype.SetCharacteristics = function(caption, charact, y0){
        var y = y0;
        var txt = caption;
        for (var c in charact){
            txt += "\n   " + c + " : " + charact[c];
        }
        var b = graphic.Text(
            txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            0, 
            OPTIONS.TILE_SIZE + 7
        );
        b.position.x = 20;
        b.position.y = y;
        y += b.height;
        this.bonuses.push(b);
        this.addChild(b);
        return y;
    }

    Examine.prototype.SetData = function(data){
        var txt = '';
        var bonuses = data.bonuses;
        var effects = data.effects;
        var characteristics = data.stats;
        delete data.action;
        delete data.result;
        delete data.bonuses;
        delete data.stats;
        delete data.inventory;
        for(var i in data)
            txt += i + ' : ' + data[i] + "\n";
        this.SetText(txt);
        var y = this._text.position.y + this._text.height;
        this.ClearBonuses();
        if(bonuses)
            y = this.SetBonuses("bonuses : ", bonuses, y);
        if(effects)
            y = this.SetBonuses("effects : ", effects, y);
        if(characteristics)
            y = this.SetCharacteristics("characteristics : ", characteristics, y);
    }

    Examine.prototype.SetText = function(text){
        this.txt = text;
        if(this._text){
            this.removeChild(this._text);
        }
        this._text = graphic.Text(
            this.txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white', wordWrap : true, wordWrapWidth : 200},
            0, 
            OPTIONS.TILE_SIZE + 7
        );
        this.addChild(this._text);
        this._text.position.x = 20;
        this._text.position.y = 20;
        return this._text;
    }

    Examine.prototype.Close = function(){
        this.visible = false;
    }

    Examine.prototype.Show = function(){
        this.visible = true;
    }

    Examine.prototype.Toggle = function(){
        this.visible = !(this.visible);
    }

    function View(player){
        this.player = player;
        this.actors = {};
        this.background = new Background();
        //this.examine_container = new PIXI.DisplayObjectContainer();
        //graphic.stage.addChild(this.examine_container);
        this.bounds = null;
        /*this.__defineSetter__("examine", function(e){
            if(this._examine)
                graphic.Remove(this._examine)
            var txt = '';
            delete e.action;
            delete e.result;
            for(var i in e)
                txt += i + ' : ' + e[i] + "\n";
            this._examine = graphic.Text( 
                txt, 
                {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
                0, 
                OPTIONS.TILE_SIZE + 7
            )
            this._examine = graphic.DrawObj(this._examine);
            this._examine.position.x = 20;
            this._examine.position.y = 20;
        })*/

    }

    View.prototype.initExamine = function(){
        this.examine = new Examine();
        graphic.stage.addChild(this.examine);
    }

    View.prototype.setActors = function(players){
        var actors_on_scene = [];
        for(var i = 0; i < players.length; ++i){
            var id = players[i].id;
            var x = players[i].x;
            var y = players[i].y;
            if(this.actors[id]){
                this.actors[id].Move({x: x, y: y}, this.player);
                if(this.actors[id].SetHP)
                    this.actors[id].SetHP(players[i].health);
            } else {
                var name = players[i].name || players[i].type;
                var t = actorInfo[name] || actorInfo['player'];
                var a = name;
                if(players[i].type == 'item')
                    this.actors[id] = new Item(players[i]);
                else if(players[i].type == 'projectile')
                    this.actors[id] = new Projectile(players[i]);
                else
                    this.actors[id] = new t.class(id, x, y, a, {cur : players[i].health, max : players[i].maxHealth}, players[i].login, true, this.player, t.opt);
            }
            actors_on_scene[id] = true;
        }
        for(var i in this.actors)
            if(!actors_on_scene[i]){
                this.actors[i].Destroy();
                delete this.actors[i];
            }
        AnimationManager.Update();
    }

    View.prototype.setMap = function(map, player_pos){
        this.background.SetMap(map, player_pos)
    }

    View.prototype.setDictionary = function(dict){
        this.background.dictionary = dict;
        this.dictionary = dict;
    }

    View.prototype.StartEvent = function(event) {
        var action = event.event;
        switch (action){
            case 'attack' : this.Attack(event); break;
            case 'explode': this.Explode(event);break;
        }
    }

    View.prototype.Attack = function(data){
        var target_id = data.target;
        var a = data.attacker;
        var target = (target_id == this.player.id) ? this.player : this.actors[target_id];
        AnimationManager.RunAnimation(data.description.blowType, target.pt);
        target.Hit();
        if(data.killed)
            target.Kill();
    }

    View.prototype.Explode = function(data){
        var anim = AnimationManager.RunAnimation('explosion', data);
        anim.scale.x = data.radius * data.radius;
        anim.scale.y = data.radius * data.radius;
    }



    View.prototype.DefineImaginaryBounds = function(){
        var off_x = (OPTIONS.screenColumnCount) / 2 * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE;
        var off_y = (OPTIONS.screenRowCount   ) / 2 * OPTIONS.TILE_SIZE - OPTIONS.TILE_SIZE;
        var c = { x: graphic.width / 2, y : graphic.height / 2};
        var g = new PIXI.Graphics(0, 0);
        g.beginFill(0);
        g.drawRect(0, 0, c.x - off_x, graphic.height);
        g.drawRect(0, 0, graphic.width,  c.y - off_y);
        g.drawRect(0, graphic.height - c.y + off_y - OPTIONS.TILE_SIZE, graphic.width, graphic.height);
        g.drawRect(graphic.width - c.x + off_x - OPTIONS.TILE_SIZE, 0, graphic.width, graphic.height);
        this.bounds = g;
        graphic.stage.addChild(this.bounds);
    }

    View.prototype.Clear = function(graphic){
        graphic.Clear();
    }

    View.prototype.defineRadiusFromMap = function(map){
        OPTIONS.screenRowCount = map.length;
        if(map[0] == undefined)
            alert("Смените сервак он харкается фигней")
        OPTIONS.screenColumnCount = map[0].length;
        graphic = GLOBAL.graphic;
        this.background.DefineMap(map);
        this.DefineImaginaryBounds();
        this.initExamine();
    }

    return View;
})