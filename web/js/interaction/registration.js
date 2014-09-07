define(['jquery', 'utils/utils'], function($, utils) {
    function fetchData() {
        return {
            "login"    : $("#username").val(),
            "password" : $("#password").val(),
        };
    }

    function loginSuccess(data, textStatus, jqXHR) {
        $msg = $('#message');
        switch(data['result']){
            case 'ok': 
                $msg.text('Вы успешно авторизованы! Через две секунды вас перебросит на страницу с игрой!').removeClass("Err");
                setTimeout(function () {
                    window.location.href = 
                        "/game/?sid=" + data['sid'] +
                        "&soсket=" + data['webSocket'] + 
                        "&fistId=" + data['fistId'] +
                        "&id=" + data['id'] + 
                        '&srv=' + $('#server').val();
                }, 2000); 
                break;
            case 'invalidCredentials': 
                $msg.text('Неверный логин или пароль').addClass("Err"); break;
            default : 
                $msg.text('Нет ответа от сервера').addClass("Err"); break;
        }
    }

    function registerSuccess(data, textStatus, jqXHR) {
        $msg = $('#message');
        switch(data['result']){
            case 'ok': 
                $msg.text('Регистрация прошла успешно').removeClass("Err"); 
                $("#class_container").slideUp( "slow" );
                $("#registerBtn").slideDown("slow");
                break;
            case 'loginExists' : $msg.text('Такой логин существует').addClass("Err"); break;
            case 'badLogin'    : $msg.text('Логин должен состоять из букв и/или цифр, длинной от 2 до 36 символов').addClass("Err"); break;
            case 'badPassword' : $msg.text('Пароль должен быть длинной от 6 до 36').addClass("Err"); break;
            case 'badClass'    : $msg.text('Данный класс еще не доступен').addClass("Err"); break;
            default            : $msg.text('Нет ответа от сервера').addClass("Err"); break;
        }
   }

    $(function() {

        function hightlight(I){
            I.fadeTo("fast", 1);
        }

        function unhighlight(I){
            I.fadeTo("fast", 0.5);
        }

        var picked_class;
        var $msg = $('#message');
        $("#loginBtn").click(function() {
            var data = fetchData();
            data["action"] = "login";
            var url = $('#server').val();
            utils.sendRequest(data, loginSuccess, url);
        });

        $("#registerBtn").click(function () {
            $("#class_container").slideDown( "slow" );
            $("#registerBtn").slideUp('slow');
            unhighlight($("#class_container img"));
            picked_class = null;
            $msg.text('Выберите класс персонажа').removeClass("Err");
        });

        var msg_beforehover;
        $("#class_container img").fadeTo("fast", 0.5).hover(function(){
            msg_beforehover = $msg.removeClass("Err").text();
            $msg.text($(this).attr('caption'));
            hightlight($(this));
        }, function(){
            if (picked_class == this) return;
            $msg.text(msg_beforehover);
            unhighlight($(this));
        });


        $("#class_container img").click(function(){
            unhighlight($("#class_container img"));
            picked_class = this;
            hightlight($(this));
        })

        $("#applyBtn").click(function(){
            if (!picked_class){
                $msg.text('Нужно выбрать класс персонажа').addClass("Err");
                return;
            }
            var data = fetchData();
            data["action"] = "register";
            data["class"]  = $(picked_class).attr('value');
            var url = $('#server').val();
            utils.sendRequest(data, registerSuccess, url);

        })

        $("#testBtn").click(function(){
            window.location.href = "/tests/";
        })
    })
});