function fetchData() {
    return {
        "login" : $("#username").val(),
        "password" : $("#password").val()
    };
}

function loginSuccess(data, textStatus, jqXHR) {
    alert(JSON.stringify(data));
}

function registerSuccess(data, textStatus, jqXHR) {
    var msg;
    
    if(data['result'] == 'ok'){
        $('#message').text('Регистрация прошла успешно').removeClass("Err");    
    } else if(data['result'] == 'loginExists'){
        $('#message').text('Такой логин существует').addClass("Err");   
    } else if(data['result'] == 'badLogin'){
        $('#message').text('Логин должен состоять из букв и/или цифр, длинной от 2 до 36 символов').addClass("Err");   
    } else if(data['result'] == 'badPassword'){
        $('#message').text('Пароль должен быть длинной от 2 до 36').addClass("Err"); // something else
    } else {
        $('#message').text('Сервер не найден').addClass("Err");
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