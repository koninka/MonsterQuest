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
    alert(JSON.stringify(data));
}

function SendRequest(data, callback, url) {
    var url = url || "/json";
    $.ajax({
        method : "POST",
        url : url,
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

