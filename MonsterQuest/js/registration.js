function fetchData() {
    return {
        "login" : $("#username").val(),
        "password" : $("#password").val()
    };
}

function loginSuccess(data, textStatus, jqXHR) {
    if(data['result'] == 'ok'){
        $('#message').text('Вы успешно авторизованы! Через две секунды вас перебросит на страницу с игрой!').removeClass("Err");
        setTimeout(function () {
            window.location.href = "/game/?sid=" + data['sid'] + "&soсket=" + data['soсket'] +"&id=" + data['id'];
        }, 2000);
    } else if(data['result'] == 'invalidCredentials'){
        $('#message').text('Неверный логин или пароль').addClass("Err");
    } else {
        $('#message').text('Нет ответа от сервера').addClass("Err");
    }
}

function registerSuccess(data, textStatus, jqXHR) {
    if(data['result'] == 'ok'){
        $('#message').text('Регистрация прошла успешно').removeClass("Err");
    } else if(data['result'] == 'loginExists'){
        $('#message').text('Такой логин существует').addClass("Err");
    } else if(data['result'] == 'badLogin'){
        $('#message').text('Логин должен состоять из букв и/или цифр, длинной от 2 до 36 символов').addClass("Err");
    } else if(data['result'] == 'badPassword'){
        $('#message').text('Пароль должен быть длинной от 2 до 36').addClass("Err"); // something else
    } else {
        $('#message').text('Нет ответа от сервера').addClass("Err");
    }
}

$("#loginBtn").click(function() {
    var data = fetchData();
    data["action"] = "login";
    var url = $('#server').val();
    SendRequest(data, loginSuccess, url);
});

$("#registerBtn").click(function () {
    var data = fetchData();
    data["action"] = "register";
    var url = $('#server').val();
    SendRequest(data, registerSuccess, url);
});