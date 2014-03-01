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

$("#loginBtn").click(function() {
    var data = fetchData();
    data["action"] = "login";
    $.ajax({
            method : "POST",
            url : "/json",
            data : JSON.stringify(data),
            success : loginSuccess
        });
});

$("#registerBtn").click(function () {
    var data = fetchData();
    data["action"] = "register";
    $.ajax({
            method : "POST",
            url : "/json",
            data : JSON.stringify(data),
            success : registerSuccess
        });
});

