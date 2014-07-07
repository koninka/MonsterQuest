requirejs.config({
   baseUrl: '/js/tests',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils'
   }
});

requirejs(['jquery', 'tester', 'auth', 'simple_walk', 'test_mode', 'move_flag', 'mobs_behaviour', 'items'], function($, tester, auth, simple_walk, test_mode, move_flag, mobs_behaviour, items) {
   $(function() {
      var StartTesting = function(){
        $('#mocha').empty();
         tester.setUrl($("#url").val());

         auth.Test();
         simple_walk.Test();
         test_mode.Test();
         move_flag.Test();
         mobs_behaviour.Test();
         items.Test();
         mocha.run(); 
      }
      $("#urlBtn").click(StartTesting);
      $("#url").val('/json').keydown(function(e){
         if(e.which == 13){
            e.preventDefault();
            StartTesting(); 
         }
      })
   });
});