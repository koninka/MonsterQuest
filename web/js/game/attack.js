define(['global', 'options'], function(GLOBAL, OPTIONS){
    function Attack(desc, pt){
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
    return Attack;
})