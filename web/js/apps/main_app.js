requirejs.config({
   baseUrl: '/js/interaction',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils'
   }
});

requirejs(['registration'], function() {});