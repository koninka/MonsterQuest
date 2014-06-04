define(['options', 'global', 'actor_info', 'attack', 'item'], function(OPTIONS, GLOBAL, actorInfo, attack,Item) {
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
        var off_x = OPTIONS.screenColumnCount / 2;
        var off_y = OPTIONS.screenRowCount    / 2;
        var y = (-pt.y % 1 - off_y) * TS + TS / 2;
        for(var i = 0; i < map.length; ++i){
            var x = (-pt.x % 1 - off_x) * TS + TS / 2;
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
                var tile = graphic.Draw(this.dictionary[map[i][j]], 0, 0);
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
    }

    Examine.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
    Examine.prototype.constructor = Examine;

    Examine.prototype.SetText = function(text){
        this.txt = text;
        if(this._text){
            this.removeChild(this._text);
        }
        this._text = graphic.Text(
            this.txt, 
            {'font': '12px Helvetica', 'font-weight': 'bold', fill: 'white'},
            0, 
            OPTIONS.TILE_SIZE + 7
        );
        this.addChild(this._text);
        this._text.position.x = 20;
        this._text.position.y = 20;
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
       // var last = null;
        players.push({id: 100500, type: "item", name: "ring", x: 10, y: 10});
        for(var i = 0; i < players.length; ++i){
            var id = players[i].id;
            var x = players[i].x;
            var y = players[i].y;
            if(this.actors[id]){
                this.actors[id].Move({x: x, y: y}, this.player);
                if(players[i].type != 'item')
                    this.actors[id].SetHP(players[i].hp);
            } else {
                var t = this.actorInfo(players[i].symbol);
                var a = this.dictionary[players[i].symbol];
                if(players[i].type == 'item'){
                    this.actors[id] = new Item(players[i]);
                } else
                    this.actors[id] = new t.class(id, x, y, a, {cur : players[i].hp, max : players[i].max_hp}, players[i].login, true, this.player, t.opt);
            }
            actors_on_scene[id] = true;
        }
        for(var i in this.actors)
            if(!actors_on_scene[i]){
                this.actors[i].Destroy();
                delete this.actors[i];
            }
        /*if(last){
            if(this._examine){
                graphic.stage.swapChildren(graphic.stage.children[graphic.stage.children.length-2], this.bounds);
                graphic.stage.swapChildren(graphic.stage.children[graphic.stage.children.length-1], this._examine);
            } else 
                graphic.stage.swapChildren(this.bounds, last.container);
        }*/
    }

    /*View.prototype.setItems = function(items){
        if(!items) return;
        var items_on_scene = {};
        for(var i = 0; i < items.length; ++i){
            var item = items[i];
            var id = item.id;
            if(this.items[id]){
                this.items[id].x = item.x;
                this.items[id].y = item.y;
            } else {
                this.items[id] = item;
            }
            founded_items[id] = true;
        }
        for(var i in this.items){
            if(!founded_items[i]){
                delete this.items[i];
                //RemoveItem(this.items[i]);
            }
        }
    }*/

    View.prototype.setMap = function(map, player_pos){
        this.background.SetMap(map, player_pos)
    }

    View.prototype.actorInfo = function(symbol){

        var t = actorInfo[this.dictionary[symbol]];
        if (!t){

            t = actorInfo['player'];
        }
        return t;
    }

    View.prototype.setDictionary = function(dict){
        this.background.dictionary = dict;
        this.dictionary = dict;
    }

    View.prototype.StartEvent = function(event) {
        var action = event.action;
        this[action](event);
    }

    View.prototype.attack = function(data){
        var target_id = data.target;
        var a = data.attacker;
        //console.log(data);
        var target = (target_id == this.player.id) ? this.player : this.actors[target_id];
        attack(data.description, target.pt);
        target.Hit();
        if(data.killed)
            target.Kill();
            
        //this.actors[a].Attack(data.description, this.actors[t].pt);
        //this.actors[t].Hit();
    }

    View.prototype.DefineImaginaryBounds = function(){
        var off_x = (OPTIONS.screenColumnCount) / 2 * OPTIONS.TILE_SIZE;
        var off_y = (OPTIONS.screenRowCount   ) / 2 * OPTIONS.TILE_SIZE;
        var c = { x: graphic.width / 2, y : graphic.height / 2 };
        var g = new PIXI.Graphics(0, 0);
        g.beginFill(0);
        g.drawRect(0, 0, c.x - off_x, graphic.height);
        g.drawRect(0, 0, graphic.width,  c.y - off_y);
        g.drawRect(0, graphic.height - c.y + off_y - OPTIONS.TILE_SIZE, graphic.width, c.y - off_y);
        g.drawRect(graphic.width - c.x + off_x - OPTIONS.TILE_SIZE, 0, c.x - off_x, graphic.height);
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