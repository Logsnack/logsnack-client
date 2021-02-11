export default function () {
    let websocket = null;
    let ws = {
        state(){
            return websocket.readyState;
        },
        connect (url) {
            websocket = new WebSocket(url);
        },
        send (message, _interval) {
            let interval = _interval ? _interval : 1000;
            return ws.waitForConnection(function () {
                websocket.send(message);
            }, interval);
        },
        waitForConnection (callback, interval) {
            if (websocket && websocket.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    ws.waitForConnection(callback, interval);
                }, interval);
            }
        }
    }
    return ws;
}
