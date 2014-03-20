requirejs.config({
   baseUrl: '/js/game',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils',
      logout: '../interaction/logout'
   }
});

requirejs(['jquery', 'game', 'logout'], function($, game) {
   $(function() {
      game.Start();
   })
});