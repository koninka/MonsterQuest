define(['utils/utils'], function(utils) {
   var url = null;

   function send(data, callback) {
      utils.sendRequest(data, callback, url);
   }

   function setUrl(new_url) {
      url = new_url;
   }

   function getRandomString() {
      return utils.randstring();
   }

   return {
      send:            send,
      setUrl:          setUrl,
      getRandomString: getRandomString
   }
});