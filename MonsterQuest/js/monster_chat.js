$(function() {

    var conn;
    var msg = $("#msg");
    var log = $("#log");
    var sid = getQueryVariable('sid');
    var uri = getQueryVariable('soсket');
    var tick;
    function appendLog(msg) {
        var d = log[0]
        var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
        msg.appendTo(log)
        if (doScroll) {
            d.scrollTop = d.scrollHeight - d.clientHeight;
        }
    }

    $("#form").submit(function() {
        if (!conn) {
            return false;
        }
        if (!msg.val()) {
            return false;
        }
        conn.send(JSON.stringify({msg:msg.val(), "sid":sid}));
        msg.val("");
        return false
    });



    if (window["WebSocket"]) {
        conn = new WebSocket("ws://" + uri);
        conn.onopen = function(evt) {
            appendLog($("<div><b>Connection opened.</b></div>"))
        }
        conn.onclose = function(evt) {
            appendLog($("<div><b>Connection closed.</b></div>"))
        }
        conn.onmessage = function(evt) {
            appendLog($("<div/>").text(evt.data));
            var data = JSON.parse(evt.data);
            if (data["tick"])
                tick = data["tick"];
        }
        $(this).keydown(function(event) {
            var data = {};
            data["sid"] = sid;
            var key = event.which;
            if (key == 81) {
                data["action"] = "getDictionary";
            } else {
                data["action"] = "move";
                var dir = "";
                switch (key) {
                    case 38: dir = "north"; break;
                    case 39: dir = "east"; break;
                    case 40: dir = "south"; break;
                    case 37: dir = "west"; break;
                }
                data["direction"] = dir;
                data["tick"] = tick;
            }
            conn.send(JSON.stringify(data));
        });
    } else {
        appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
    }
});