function WSConnect(wsuri, onload, onopen, onclose, onmessage){

    var sock = null;
    if(wsuri){
        wsuri = 'ws://'+wsuri;
    }
    //wsuri = wsuri || "ws://localhost:8080/websocket"; // <-- note new path

    sock = new WebSocket(wsuri);
    sock.onopen = onopen;
    sock.onclose = onclose;
    sock.onmessage = onmessage;
    sock.sendJSON = function (/*JSON*/ msg) {
        sock.send(JSON.stringify());
    };
    return sock;
}

