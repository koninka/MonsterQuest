
function SendRequest(data, callback, url) {
    var url = url || "/json";
    $.ajax({
        method : "POST",
        url : url,
        data : JSON.stringify(data),
        success : callback
    });
}

