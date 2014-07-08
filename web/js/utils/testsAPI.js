define(['tester', 'utils/ws', 'jquery'], function(tester, wsock, JQuery) {

    var expect   = chai.expect;
    
    var stopTestingAction = "stopTesting",
        startTestingAction = "startTesting",
        equipAction = "equip",
        unequipAction = "unequip",
        destroyAction = "destroyItem",
        useAction = "use",
        enforceAction = "enforce",
        loginAction = "login",
        logoutAction = "logout",
        pickUpAction = "pickUp",
        dropAction = "drop",
        setUpConstAction = 'setUpConst',
        getConstAction = 'getConst',
        setUpMapAction = 'setUpMap',
        putPlayerAction = 'putPlayer',
        putMobAction = 'putMob',
        putItemAction = 'putItem',
        examineAction = 'examine';

    var actionResultOk = 'ok',
        actionResultBadId = 'badId';


    var data = {
      ssid     : null,
      wsuri    : null,
      login    : null,
      actor_id : null,
      password : null,
      ws       : null
    };

    var consts = {};
    var ticksPerSecond = 50;
    var tickDuration = 1000 / ticksPerSecond;
    var slideThreshold = 0.2;
    var playerVelocity = 0.12;
    var pickUpRadius = 2.0;
    var default_damage = "3d2";

    function Prepare(done) {
      tester.updateData(data);
      tester.registerAndLogin(data, done);
    }

    function Logout(done) {
        SendViaWS({action: logoutAction});
        SetWSHandler(function() { done(); });
    }

    function AfterEach(done) {
        SetWSHandler(function(e){
            var resp = JSON.parse(e.data);
            if(resp['action'] == stopTestingAction)
                done();
        });
        SendViaWS({action: stopTestingAction});
    }

    function SendViaWS(obj) {
      obj["sid"] = data.ssid;
      data.ws.sendJSON(obj);
    }

    function StartTesting() {
        SendViaWS({action: startTestingAction});
    }

    function StopTesting() {
        SendViaWS({action: stopTestingAction});
    }

    function SetUpConstants(playerVelocity_, ticksPerSecond_, slideThreshold_, pickUpRadius_) {
        playerVelocity_ = playerVelocity_ || playerVelocity;
        slideThreshold_ = slideThreshold_ || slideThreshold;
        ticksPerSecond_ = ticksPerSecond_ || ticksPerSecond;
        pickUpRadius_ = pickUpRadius_ || pickUpRadius;
        SendViaWS({
            action: setUpConstAction,
            playerVelocity: playerVelocity_,
            ticksPerSecond: ticksPerSecond_,
            slideThreshold: slideThreshold_,
            pickUpRadius: pickUpRadius_
        });
    }

    function GetConstants() {
      SendViaWS({action: getConstAction});
    }

    function SetUpMap(map) {
      SendViaWS({action: setUpMapAction, map: map});
    }

    function PutPlayer(x, y, inventory, stats, slots) {
      inventory = inventory || [];
      stats = stats || {};
      slots = slots || {};
      SendViaWS({
         action: putPlayerAction,
         x: x,
         y: y,
         inventory: inventory,
         stats: stats,
         slots: slots
      });
    }

    function PutItem(x, y, weight, iClass, type, bonuses, effects, subtype) {
        SendViaWS({
            action: putItemAction,
            x: x,
            y: y,
            item: MakeItem(weight, iClass, type, bonuses, effects, subtype)
        });
    }

    function PutMob(x, y, race, damage, flags, inventory, stats) {
        flags = flags || [];
        inventory = inventory || [];
        stats = stats || {};
        damage = damage || default_damage;
        SendViaWS({
            action: putMobAction,
            x: x,
            y: y,
            flags: flags,
            race: race,
            inventory: inventory,
            stats: stats,
            dealtDamage: damage
        });
    }

    function MakeItem(weight, iClass, type, bonuses, effects, subtype) {
        weight = weight || 1;
        iClass = iClass || "garment";
        type = type || "shield";
        bonuses = bonuses || [];
        effects = effects || [];
        var item = {
            weight: weight,
            "class": iClass,
            type: type,
            bonuses: bonuses,
            effects: effects
        };
        if (subtype) {
            item["subtype"] = subtype;
        }
        return item;
    }

    function MovePlayer(sid, direction) {
      SendViaWS({
         action: enforceAction,
         enforcedAction: {
            sid: sid,
            action: "move",
            direction: direction
         }
      });
    }

    function PickUp(sid, id) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: pickUpAction,
                id: id
            }
        });
    }

    function Drop(sid, id) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: dropAction,
                id: id
            }
        });
    }

    function Use(sid, id) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: useAction,
                id: id
            }
        });
    }

    function Destroy(sid, id) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: destroyAction,
                id: id
            }
        });
    }

    function Equip(sid, id, slot) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: equipAction,
                id: id,
                slot: slot
            }
        });
    }

    function Unequip(sid, slot) {
        SendViaWS({
            action: enforceAction,
            enforcedAction: {
                sid: sid,
                action: unequipAction,
                slot: slot
            }
        });
    }

    function Examine(id, sid) {
        if (!sid)
            SendViaWS({action: examineAction, id: id});
        else 
            SendViaWS({
                action: enforceAction,
                enforcedAction: {
                    sid: sid,
                    action: examineAction,
                    id: id
                }
            });
    }

    function Sleep(time, callback, param) {
      setTimeout(function() { callback(param); }, time)
    }

    function GetShiftByDir(dir) {
      switch (dir) {
         case "north": 
            return [0, - playerVelocity];
         case "south":
            return [0, playerVelocity];
         case "west":
            return [- playerVelocity, 0];
         case "east":
            return [playerVelocity, 0];
      }
    }

    function SetWSHandler(func) {
        data.ws.onmessage = func;
    }

    return {
        Prepare: Prepare,
        Logout: Logout,
        AfterEach: AfterEach,
        StartTesting: StartTesting,
        StopTesting: StopTesting,
        SetUpConstants: SetUpConstants,
        GetConstants: GetConstants,
        SetUpMap: SetUpMap,
        PutPlayer: PutPlayer,
        PutItem: PutItem,
        PutMob: PutMob,
        MakeItem: MakeItem,
        PickUp: PickUp,
        Drop: Drop,
        Use: Use,
        Destroy: Destroy,
        Examine: Examine,
        Sleep: Sleep,
        GetShiftByDir: GetShiftByDir,
        Equip: Equip,
        Unequip: Unequip,
        MovePlayer: MovePlayer,
        SetWSHandler: SetWSHandler,
        stopTestingAction: stopTestingAction,
        startTestingAction: startTestingAction,
        equipAction: equipAction,
        unequipAction: unequipAction,
        destroyAction: destroyAction,
        useAction: useAction,
        enforceAction: enforceAction,
        loginAction: loginAction,
        logoutAction: logoutAction,
        pickUpAction: pickUpAction,
        dropAction: dropAction,
        setUpConstAction: setUpConstAction,
        getConstAction: getConstAction,
        setUpMapAction: setUpMapAction,
        putPlayerAction: putPlayerAction,
        putMobAction: putMobAction,
        putItemAction: putItemAction,
        examineAction: examineAction,
        actionResultOk: actionResultOk,
        actionResultBadId: actionResultBadId,
        tickDuration: tickDuration,
        slideThreshold: slideThreshold,
        playerVelocity: playerVelocity,
        pickUpRadius: pickUpRadius,
        default_damage: default_damage
    };
});