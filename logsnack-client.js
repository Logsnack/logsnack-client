import {favicons, styles} from './styles.default';
import snackConsole from './components/snack-console/index';
export default (function(){
    let connected = false;
    window._console = window.console;
    const ws = require('./websocket').default();
    return {
        styles: styles,
        server: {
            send: function(style){
                let args = Array.from(arguments);
                args = args.splice(1);
                if (ws.connected) {
                    let e = new Error();
                    let stack = e.stack.split('\n').map(function (line) {
                        return line.trim();
                    })
                    let path = stack[3].replace('webpack-internal:///./', '');
                    let trace = path.match(/.*\s(?<funcname>.*)\s\(.*\/(?<file>.*):(?<line>\d*):(?<col>\d*)\)/).groups;
                    /** replacerFunc to avoid circular JSON. @from https://careerkarma.com/blog/converting-circular-structure-to-json/ **/
                    const replacerFunc = () => {
                        const visited = new WeakSet();
                        return (key, value) => {
                            if (typeof value === "object" && value !== null) {
                                if (visited.has(value)) {
                                    return;
                                }
                                visited.add(value);
                            }
                            return value;
                        };
                    };
                    ws.send(JSON.stringify({
                        'action': 'log',
                        'group': style,
                        'data': args,
                        'trace': trace
                    }, replacerFunc()));
                }
            },
            initialize: function(logsnackProject, websocketURL){
                ws.connect(websocketURL).then(function (e) {
                    connected = true; //? Set local connected
                    ws.send(JSON.stringify({ 'action': 'register', project: logsnackProject}));
                    ws.websocket.onmessage = function (_message) {
                        let message = JSON.parse(_message.data);
                        switch (message.action) {
                            case 'registered':
                                document.querySelector("link[rel*='icon']").href = favicons[message.color];
                                break;
                            case 'snack':
                                console.snack(message.style, message.message);
                                break;
                        }
                    }
                    window.addEventListener('focus', function () {
                        ws.send(JSON.stringify({ 'action': 'focus' }));
                    })
                });
            }
        },
        initialize () {
            let self = this;
            window.console = Object.assign({}, _console, {
                _log: function(){
                    //?Used in websocket to display connection status
                    _console.log(...Array.from(arguments));
                },
                log: function () {
                    let args = Array.from(arguments);
                    let _style = null;
                    if (typeof args[0] === "string" && args[0].startsWith('lsn:')) {
                        _style = args[0].split(":")[1];
                        args = args.splice(1);
                    }
                    let style = self.styles['log'];
                    if (_style && Object.prototype.hasOwnProperty.call(self.styles, _style)) {
                        style = self.styles[_style];
                    }

                    window._console.log(...args)
                    for(const arg of args){
                        snackConsole.push(arg);
                    }
                    if(connected){
                        self.server.send(style, ...args);
                    }
                },
                snack: function () {
                    console.log(...Array.from(arguments));
                },
            });
        }
    }
})();
