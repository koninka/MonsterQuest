define(['jquery', 'utils/utils', 'player', 'view', 'graphic', 'inventory', 'options', 'global'], 
    function(JQuery, utils, Player, View, Graphic, Inventory, OPTIONS, GLOBAL) {

    function Game(sid, wsuri) {
        this.sid      = sid;
        this.sock     = null;
        this.tick     = null;
        this.wsuri    = wsuri;
        this.player   = new Player(parseInt(utils.getQueryVariable('id')))
        this.view     = new View(this.player);
        this.dirsDown = [];
        this.graphic  = null;  //initGraphic
        this.inventory = null; // initInventory
        GLOBAL.game   = this;

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
        this.player.setHP(hp);
    }

    Game.prototype.checkKeys = function(){
        if(this.dirsDown[0]) this.movePlayer(this.dirsDown[0]);
    }

    Game.prototype.initGraphic = function() {
        this.graphic = new Graphic(this.view, this);
    }

    Game.prototype.sendViaWS = function(hash) {
        hash["sid"] = this.sid;
        this.sock.send(JSON.stringify(hash));
        //console.log("request " + JSON.stringify(hash));
    }

    Game.prototype.setPlayerCoords = function(x, y) {
        this.player.Move({x: x, y: y}, this.player);
    }

    Game.prototype.setExamineData = function(data){
        var txt = '';
        delete data.action;
        delete data.result;
        for(var i in data)
            txt += i + ' : ' + data[i] + "\n";
        this.view.examine.SetText(txt);
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
        this.inventory = new Inventory();
    }

    Game.prototype.ShowInventory = function() {
        this.inventory.Toggle();
    };

    Game.prototype.SetInventory = function(inventory) {
        this.inventory.SetItems(inventory);
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
                case "examine":
                    if(data.id != th.player.id)
                        th.setExamineData(data);
                    else
                        th.SetInventory(data.inventory);
                    console.log(JSON.stringify(data));
                    break
                case "getOptions":
                    th.setOptions(data['options']);
                case "getDictionary":
                    th.setDictionary(data.dictionary);
                    break;
                case "look":
                  
                    th.setPlayerCoords(data.x, data.y);
                    //th.setHp(data['hp']);
                    th.setMap(data['map'], th.player.pt);
                    th.setActors(data['actors']);
                  
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

    Game.prototype.InitLook = function (chain_number){
        var th = game;
        th.sock.onmessage = function(e){
            var data = JSON.parse(e.data);
            if(data["action"] == "look"){
                th.defineRadiusFromMap(data['map']);
                th.player.InitAnimation(true, th.player);
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
                th.initInventory();
                th.SetInventory(data.inventory);
                //th.setExamineData(data);
                th.InitChain(chain_number + 1);
            }
        }
        th.SelfExamine();
    }

    Game.prototype.SelfExamine = function(){
        this.sendViaWS({action: "examine", id: game.player.id})
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
            game.SelfExamine();
            game.ShowInventory();
        })

        setInterval(function(){
            game.checkKeys()
        }, 1)
    };

    Game.prototype.Init = function() {
        this.firstLook = true;
        this.initGraphic();
        this.init_chain = [];
        this.init_chain[0] = this.InitDictionary;
        this.init_chain[1] = this.InitLook;
        this.init_chain[2] = this.InitPlayer;
        this.InitChain(0);
        this.InitKeyboard()
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
            alert('Logout after 3 seconds');
            setTimeout(function () {
                window.location.href = "/";
            }, 1000);
            console.log("connection closed (" + e.code + ") reason("+ e.reason +")");
        };
        
    }

    var game  = new Game(utils.getQueryVariable('sid'), utils.getQueryVariable('soсket'));

    return game;
});