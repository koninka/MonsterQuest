requirejs.config({
   baseUrl: '/js/tests',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils'
   }
});

requirejs(['jquery', 'tester', 'auth', 'simple_walk', 'test_mode'], function($, tester, auth, simple_walk, test_mode) {
   $(function() {
      var StartTesting = function(){
        $('#mocha').empty();
         tester.setUrl($("#url").val());

         auth.Test();
         simple_walk.Test();
         test_mode.Test();

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