define(['global', 'options'], function(GLOBAL, OPTIONS){
    var animations = [];

    function Move(obj, pt){
        var p = GLOBAL.game.player;
        obj.position.x = (pt.x - p.pt.x) * OPTIONS.TILE_SIZE;
        obj.position.y = (pt.y - p.pt.y) * OPTIONS.TILE_SIZE;
        GLOBAL.graphic.Center(obj);
    }

    function Delete(a){
        var index = animations.indexOf( a );
        if(index != -1)
            animations.splice( index, 1 );
    }

    function Update(){
        for (var i = 0; i < animations.length; ++i){
            Move(animations[i], animations[i].pt)
        }
    }

    function RunAnimation(name, pt){
        var t = GLOBAL.graphic.textures[name];
        if(!t){
            console.log('animation not found', name); 
            t = GLOBAL.graphic.textures['explosion'];
        }
        var m = new PIXI.MovieClip(t);
        m.pt = pt;
        m.anchor.x = m.anchor.y = 0.5;
        var p = GLOBAL.game.player;
        m.loop = false;
        m.onComplete = function(){
            setTimeout(function(){
                Delete(m);
                GLOBAL.graphic.Remove(m);
            }, 1)
        }
        GLOBAL.graphic.DrawObj(
            m,
            m.position.x = (pt.x - p.pt.x) * OPTIONS.TILE_SIZE,
            m.position.y = (pt.y - p.pt.y) * OPTIONS.TILE_SIZE
        )
        m.play();
        animations.push(m);
        return m;
    }
    return {
        RunAnimation:RunAnimation,
        Update      :Update,
    }
})