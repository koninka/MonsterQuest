requirejs.config({
   baseUrl: '/js/tests',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils'
   }
});

requirejs(['jquery', 'tester', 'auth', 'simple_walk'], function($, tester, auth, simple_walk) {
   $(function() {
      var StartTesting = function(){
        $('#mocha').empty();
         tester.setUrl($("#url").val());

         auth.updateData();
         simple_walk.updateData();
         
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