function fetchData() {
    return {
        "login" : $("#username").val(),
        "password" : $("#password").val()
    };
}

function loginSuccess(data, textStatus, jqXHR) {
    alert(data);
}

function registerSuccess(data, textStatus, jqXHR) {
    alert(data)
}

function SendRequest(data, callback){
    $.ajax({
        method : "POST",
        url : "/json",
        data : JSON.stringify(data),
        success : callback
    });
}

$("#loginBtn").click(function() {
    var data = fetchData();
    data["action"] = "login";
    SendRequest(data, loginSucces);
});

$("#registerBtn").click(function () {
    var data = fetchData();
    data["action"] = "register";
    SendRequest(data, registerSuccess);
});

