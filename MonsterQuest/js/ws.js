function WSConnect(wsuri){

    var sock = null;
    wsuri = wsuri || "ws://localhost:8080/websocket"; // <-- note new path

    window.onload = function() {

        console.log("onload");

        sock = new WebSocket(wsuri);

        sock.onopen = function() {
            console.log("connected to " + wsuri);
        }

        sock.onclose = function(e) {
            console.log("connection closed (" + e.code + ") reason("+e.reason+")");
        }

        sock.onmessage = function(e) {
            console.log("message received: " + e.data);
        }
    }
    
    sock.sendJSON = function (/*JSON*/ msg) {
        sock.send(JSON.stringify());
    };
    return sock;
}

