define(['jquery', 'utils/utils'], function($, utils) {
   function fetchData() {
      return {
         "login" : $("#username").val(),
         "password" : $("#password").val()
      };
   }

   function loginSuccess(data, textStatus, jqXHR) {
      $msg = $('#message');
      if(data['result'] == 'ok'){
         $msg.text('Вы успешно авторизованы! Через две секунды вас перебросит на страницу с игрой!').removeClass("Err");
         setTimeout(function () {
            window.location.href = "/game/?sid=" + data['sid'] + "&soсket=" + data['webSocket'] +"&id=" + data['id'] + '&srv=' + $('#server').val();
         }, 2000);
      } else if(data['result'] == 'invalidCredentials'){
         $msg.text('Неверный логин или пароль').addClass("Err");
      } else {
         $msg.text('Нет ответа от сервера').addClass("Err");
      }
   }

   function registerSuccess(data, textStatus, jqXHR) {
      $msg = $('#message');
      if(data['result'] == 'ok'){
         $msg.text('Регистрация прошла успешно').removeClass("Err");
      } else if(data['result'] == 'loginExists'){
         $msg.text('Такой логин существует').addClass("Err");
      } else if(data['result'] == 'badLogin'){
         $msg.text('Логин должен состоять из букв и/или цифр, длинной от 2 до 36 символов').addClass("Err");
      } else if(data['result'] == 'badPassword'){
         $msg.text('Пароль должен быть длинной от 6 до 36').addClass("Err"); // something else
      } else {
         $msg.text('Нет ответа от сервера').addClass("Err");
      }
   }

   $(function() {
      $("#loginBtn").click(function() {
         var data = fetchData();
         data["action"] = "login";
         var url = $('#server').val();
         utils.sendRequest(data, loginSuccess, url);
      });

      $("#registerBtn").click(function () {
         var data = fetchData();
         data["action"] = "register";
         var url = $('#server').val();
         utils.sendRequest(data, registerSuccess, url);
      });
   })
});