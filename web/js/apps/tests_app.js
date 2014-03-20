requirejs.config({
   baseUrl: '/js/tests',
   paths: {
      jquery: '../lib/jquery',
      utils: '../utils'
   }
});

requirejs(['jquery', 'tester', 'auth', 'simple_walk'], function($, tester, auth, simple_walk) {
   $(function() {
      $("#urlBtn").click(function() {
         $('#mocha').empty();
         tester.setUrl($("#url").val());
         simple_walk.updateData();
         auth.updateData();
         mocha.run();
      });
   });
});