define(['jquery', 'utils/utils', 'player', 'view', 'graphic', 'inventory', 
    'options', 'global', 'quickpanel', 'trackbar', 'xpbar', 'characteristic_window'], 
    
function(JQuery, utils, Player, View, Graphic, Inventory, 
    OPTIONS, GLOBAL, QuickPanel, TrackBar, XPBar, CharWind) {

    var player_id = (parseInt(utils.getQueryVariable('id')));
    var fist_id = parseInt(utils.getQueryVariable('fistId'));
    var look_data = null;
    var examine_data = null;
    function Game(sid, wsuri) {
        this.sid      = sid;
        this.sock     = null;
        this.tick     = null;
        this.wsuri    = wsuri;
        //this.player   = new Player(parseInt(utils.getQueryVariable('id')))
        this.view     = new View(this.player);
        this.dirsDown = [];
        this.graphic  = null;  //initGraphic
        this.inventory = null; // initInventory
        GLOBAL.game   = this;
        this.ready = false;
    }

    Game.prototype.setDictionary = function(dict) {
        this.view.setDictionary(dict);
    };

    Game.prototype.setMap = function(map) {
        this.view.setMap(map, this.player.pt);
    };

    Game.prototype.setActors = function(actors) {
        this.view.setActors(actors);
    };

    Game.prototype.movePlayer = function(direct) {
        this.sendViaWS({action: "move", direction: direct, tick: this.tick});
    }

    Game.prototype.defineRadiusFromMap = function(map){
        this.view.defineRadiusFromMap(map);
    }

    Game.prototype.dirDown = function(dir){
        game.dirsDown.push(dir);
    }

    Game.prototype.dirUp = function(dir){
        for(var i = 0; game.dirsDown.length; ++i){
            if(game.dirsDown[i] == dir){
                game.dirsDown.splice(i, 1);
                return;
            }
        }
    }

    Game.prototype.setHP = function(hp){
        this.player.SetHP(hp);
    }

    Game.prototype.setXP = function(data){
        this.xpbar.SetXP(data.cur_xp, data.max_xp);
    }
    Game.prototype.checkKeys = function(){
        if(this.dirsDown[0]) this.movePlayer(this.dirsDown[0]);
    }

    

    Game.prototype.sendViaWS = function(hash) {
        hash["sid"] = this.sid;
        if(hash.action != 'look')
          console.log(hash);
        this.sock.send(JSON.stringify(hash));
        //console.log("request " + JSON.stringify(hash));
    }

    Game.prototype.setPlayerCoords = function(x, y) {
        this.player.Move({x: x, y: y}, this.player);
    }

    Game.prototype.setExamineData = function(data){
        this.view.examine.SetData(data);
        this.view.examine.Show();
    }

    Game.prototype.attack = function(data){
        this.view.attack(data);
    }

    Game.prototype.StartEvent = function(event) {
        var view = this.view;
        setTimeout(function(){
            view.StartEvent(event);
        }, 1)
    };

    Game.prototype.GetEvents = function(events){
        if (!events) return
        for(var i = 0; i < events.length; ++i){
            this.StartEvent(events[i]);
        }
    }

    

    Game.prototype.initInventory = function(){
        this.inventory = new Inventory(fist_id);
    }

    Game.prototype.ShowInventory = function() {
        this.inventory.Toggle();
    };

    Game.prototype.SetInventory = function(inventory, slots) {
        //console.log(inventory);
        //console.log(slots);
        this.inventory.SetItems(inventory, slots);
    };

    function OnMessage(e){
        var th = game;
        var data = JSON.parse(e.data);
        var result = data["result"];
        if (data["tick"]) {
            th.tick = data["tick"];
            th.GetEvents(data["events"]);
            th.sendViaWS({action: "look"});
        } else if (result == "badSid") {
            utils.gameShutDown("Bad user's security ID");
        } else if (result == "badId") {
            //utils.gameShutDown("Bad ID");
        } else {
            switch (data["action"]) {
                case "equip":
                    break;
                case "examine":
                    if(data.id != th.player.id || GLOBAL.SELFEXAMINE){
                        if(data.id == th.player.id){
                            GLOBAL.SELFEXAMINE = false;
                        }
                        th.setExamineData(data);
                    } else {
                        th.SetInventory(data.inventory, data.slots);
                        th.chr_wnd.UpdateCount(data.stats);
                    }
                    //console.log(JSON.stringify(data));
                    break
                case "getOptions":
                    th.setOptions(data['options']);
                case "getDictionary":
                    th.setDictionary(data.dictionary);
                    break;
                case "look":
                    th.setPlayerCoords(data.x, data.y);
                    th.setHP(data['health']);
                    th.setMap(data['map'], th.player.pt);
                    th.setActors(data['actors']);
                    th.setXP(data);
                    break;
                case "attack":
                    th.attack(data);
                    break;
            }
        }
    }

    Game.prototype.InitChain = function(number){
        if(number < this.init_chain.length)
            this.init_chain[number](number);
        else{
            this.sock.onmessage = OnMessage;
        }
    }

    Game.prototype.InitGraphic = function(chain_number) {
        var th = game;
        th.graphic = new Graphic(th.view, th);
        th.graphic.LoadTextures(function(){th.InitChain(chain_number + 1); })
    }

    Game.prototype.InitChrWnd = function(data){
        var th = game;
        th.chr_wnd = new CharWind(data.stats);
    }

    Game.prototype.InitQuickPanel = function(chain_number) {
        var th = game;
        th.InitXPBar(look_data);
        th.quickpanel = new QuickPanel(); 
        th.initInventory();
        th.SetInventory(examine_data.inventory, examine_data.slots);
        th.InitChrWnd(examine_data);
        th.InitChain(chain_number + 1);   
    };

    Game.prototype.InitDictionary = function (chain_number){
        var th = game;
        th.sock.onmessage = function(e){
            var data = JSON.parse(e.data);
            if(data["action"] == "getDictionary"){
                th.setDictionary(data.dictionary);
                th.InitChain(chain_number + 1);
            }
        }
        th.sendViaWS({action: "getDictionary"});
    }

    Game.prototype.InitXPBar = function (data){
        game.xpbar = new XPBar(data.cur_xp, data.max_xp);
    }

    Game.prototype.InitLook = function (chain_number){
        var th = game;
        th.sock.onmessage = function(e){
            var data = JSON.parse(e.data);
            if(data["action"] == "look"){
                th.defineRadiusFromMap(data['map']);
                th.player.InitAnimation(true, th.player);
                look_data = data;
                th.InitChain(chain_number + 1);
            }
        }
        th.sendViaWS({action: "look"});
    }

    Game.prototype.InitPlayer = function (chain_number){
        var th = game;
        th.sock.onmessage = function(e){
            var data = JSON.parse(e.data);
            if(data["action"] == "examine"){
                examine_data = data;
                th.player = new Player(player_id, data['login'], data['health'], data['maxHealth']);
                th.view.player = th.player;
                th.InitChain(chain_number + 1);
            }
        }
        th.SelfExamine();
    }

    Game.prototype.InitTrackBar = function(chain_number){
        GLOBAL.trackbar = new TrackBar();
        game.InitChain(chain_number + 1);
    }

    Game.prototype.SelfExamine = function(){
        this.sendViaWS({action: "examine", id: player_id})
    }

    Game.prototype.InitKeyboard = function() {
        KeyboardJS.on('up, w', function() {
            game.dirDown('north');
        }, function(){
            game.dirUp('north');
        })

        KeyboardJS.on('right, d', function() {
            game.dirDown('east');
        }, function(){
            game.dirUp('east');
        })

        KeyboardJS.on('down, s', function() {
            game.dirDown('south');
        }, function(){
            game.dirUp('south');
        })

        KeyboardJS.on('left, a', function() {
            game.dirDown('west');
        }, function(){
            game.dirUp('west');
        })

        KeyboardJS.on('ctrl > enter', function() {
            var e = $('#view canvas').get(0);
            if(e.webkitRequestFullscreen)//webkitRequestFullScreen есть разница
                e.webkitRequestFullscreen();
            else if(e.mozRequestFullScreen)
                e.mozRequestFullScreen();
        });

        KeyboardJS.on('i', function(){
            if(!game.inventory.drawable.visible)
                game.SelfExamine();
            game.ShowInventory();
        });

        KeyboardJS.on('p', function(){
            if(!game.chr_wnd.visible)
                game.SelfExamine();
            game.chr_wnd.Toggle();
        })

        setInterval(function(){
            game.checkKeys()
        }, 1)
    };

    Game.prototype.Init = function() {
        this.firstLook = true;
        this.init_chain = [];
        var I = this;
        function AddToChain(initFunc){
            I.init_chain.push(initFunc)
        }
        AddToChain(this.InitGraphic);
        AddToChain(this.InitPlayer);
        AddToChain(this.InitLook);
        AddToChain(this.InitDictionary);
        AddToChain(this.InitQuickPanel);
        AddToChain(this.InitTrackBar);
        
        this.InitChain(0);
        this.InitKeyboard();
        this.ready = true;
    };

    Game.prototype.Start = function() {
        if (!this.sid) {
            utils.gameShutDown();
            return;
        }
        this.sock = new WebSocket(this.wsuri);
        this.sock.onopen = function(e) {
            console.log("Connection open");
            game.Init();
        }
        this.sock.onclose = function(e) {
            //alert('Connection closed');
            setTimeout(function () {
                window.location.href = "/";
            }, 1000);
            console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
        };
        
    }

    var game  = new Game(utils.getQueryVariable('sid'), utils.getQueryVariable('soсket'));

    return game;
});