define(['actors'], function(Actors){
   return {
      player : {
         class: Actors.ActorSTD,
         opt : {
            idle : false,
         }
      },
      zombie : {
         class : Actors.ActorATD,
         opt : {
            idle : false,
         }
      },
      "Scrawny cat" : {
         class: Actors.ActorRPG,
         opt : {
            idle : true,
         }
      },
      "Scruffy little dog" : {
         class: Actors.ActorRPG,
         opt : {
            idle : false
         }
      }
   }
})