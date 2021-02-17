export default function () {
    let ws = {
        connected: false,
        connectable: true,
        retryConnection: 3,
        websocket: null,
        connect: function (url) {
            let self = this;
            self.websocket = new WebSocket(url);
            return new Promise(function (resolve, reject) {
                self.websocket.onerror = e => {
                    console._log(`Locksnack -- connection attempt : ${4 - self.retryConnection}`);
                    e.target.readyState === 3 && --self.retryConnection;
                    if (self.retryConnection > 0) {
                        setTimeout(() => resolve(self.connect(url)), 1000);
                    } else {
                        console._log(`Locksnack -- unable to connect to websocket : fallback to classic console.log`);
                        self.connectable = false;
                    }
                };
                self.websocket.onopen = e => {
                    self.connected = true;
                    console._log(`WS connection Status: ${e.target.readyState}`);
                    resolve(ws);
                };
            });
        },
        send (message, _interval) {
            let self =this;
            let interval = _interval ? _interval : 1000;
            return ws.waitForConnection(function () {
                self.websocket.send(message);
            }, interval);
        },
        waitForConnection (callback, interval) {
            if (ws.websocket && ws.websocket.readyState === 1) {
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
