import JsonViewer from './json-viewer/json-viewer';
import {favicons, styles} from './styles.default';
require('./json-viewer/scss/types.css');
require('./json-viewer/scss/style.css');
require('./assets/css/toast.css');
function createSnack (style, args) {
    //CC: Container creation
    let container = document.getElementById('logsnack-container');
    let layout = document.getElementById('logsnack-layout');
    if (!container) {
        container = document.createElement('div');
        layout = document.createElement('div');
        layout.id = 'logsnack-layout';
        container.id = 'logsnack-container';
        document.body.append(container);
        document.body.append(layout);
    }
    let snack = document.createElement('div');
    let id = '_' + Math.random().toString(36).substr(2, 9);
    //END-CC

    //SC : Snack creation
    snack.innerHTML = `
                <div class="logsnack-content" style="${style.style}" id="${id + '-content'}">
                    <div class="logsnack-left">${style.prefix}</div>
                    <div class="logsnack-center">${args[1] ? args[1] : args[0]}</div>
                    <div class="logsnack-right" id="${id + '-close'}">×</div>
                </div>
                <div class="logsnack-modalcontent">
                    <div class="logsnack-jsonviewer"></div>
                </div>
                
                `;
    snack.id = id;
    snack.className = 'logsnack';
    // snack.setAttribute('style', style.style);
    let snacks = document.getElementsByClassName('logsnack');
    let last = snacks[snacks.length - 1];
    let lastpos = (document.body.offsetHeight - (last ? last.offsetTop : document.body.offsetHeight));
    // snack.style.setProperty('--bottom', (lastpos) + 12 + 'px');
    container.appendChild(snack);
    //END-SC
    console.log(args[0], typeof args[0]);
    if (typeof args[0] === 'object') {
        new JsonViewer(args[0], document.querySelector(`#${id} .logsnack-jsonviewer`))
    }
    else{
        document.querySelector(`#${id} .logsnack-jsonviewer`).innerHTML = args[0];
    }

    let createTimeout = function () {
        if (style.timeout === false) {
            return false;
        }
        return setTimeout(function () {
            snack.classList.add('logsnack-exit');
            setTimeout(function () {
                container.removeChild(snack);
            }, 500);
        }, style.timeout);
    }
    let timeout = createTimeout();

    //CL : Create listeners
    layout.addEventListener('click', function () {
        let snacks = document.getElementsByClassName('logsnack');
        for (let s of snacks) {
            if (s.classList.contains('logsnack-modal')) {
                s.classList.remove('logsnack-modal');
            }
        }
        if (layout.classList.contains('logsnack-layout-visible')) {
            layout.classList.remove('logsnack-layout-visible');
        }
    });
    document.getElementById(id + '-content').addEventListener('click', function () {

        if (snack.classList.contains('logsnack-modal')) {
            snack.classList.remove('logsnack-modal');
            if (layout.classList.contains('logsnack-layout-visible')) {
                layout.classList.remove('logsnack-layout-visible');
            }
            timeout = createTimeout();
        } else {
            snack.classList.add('logsnack-modal');
            if (!layout.classList.contains('logsnack-layout-visible')) {
                layout.classList.add('logsnack-layout-visible');
            }
            if (timeout !== false) {
                clearTimeout(timeout);
            }
        }

    });
    document.getElementById(id + '-close').addEventListener('click', function () {
        snack.classList.add('logsnack-exit');
        setTimeout(function () {
            container.removeChild(snack);
        }, 500);
    });
    //END-CL
}
let argument = {
    typeOf: function (arg) {
        let res = {
            type: typeof arg,
            preview: arg
        }
        if (res.type === "object") {
            let matches = arg.toString().match(/\[object\s(?<ptype>.*)\]/);
            if(matches){
                res.ptype = matches.groups.ptype;
                res.preview = res.ptype;
                if(res.ptype === 'Object'){
                    res.preview = JSON.stringify(arg);
                }
            }
        }
        return res;
    }
}
export default function (logsnackProject, websocketURL) {
    let _console = window.console;
    let ws = require('./websocket').default();
    let connected = false;
    let lsn = {
        styles: styles,
        console: _console,
        addStyle(name, definition){
            let style = Object.assign({name: name}, definition);
            if(Object.prototype.hasOwnProperty.call(this.styles, name)){
                style = Object.assign(this.styles[name], definition);
            }
            this.styles[name] = style;
        },
        initialize () {
            let self = this;
            window.console = Object.assign({}, _console, {
                _log () {
                    _console.log(...arguments);
                },
                log: function () {
                    let args = Array.from(arguments);
                    let _style = null;
                    if (argument.typeOf(args[0]).type === "string" && args[0].startsWith('lsn:')) {
                        _style = args[0].split(":")[1];
                        args = args.splice(1);
                    }
                    let style = self.styles['log'];
                    if (_style && Object.prototype.hasOwnProperty.call(self.styles, _style)) {
                        style = self.styles[_style];
                    }

                    lsn.log(style, ...args);
                },
                snack: function () {
                    let args = Array.from(arguments);
                    let _style = null;
                    if (argument.typeOf(args[0]).type === "string" && args[0].startsWith('lsn:')) {
                        _style = args[0].split(":")[1];
                        args = args.splice(1);
                    }
                    let style = self.styles['log'];
                    if (_style && Object.prototype.hasOwnProperty.call(self.styles, _style)) {
                        style = self.styles[_style];
                    }
                    createSnack(style, args);
                },
            })
            ws.connect(websocketURL).then(function (e) {
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
        },
        log (style) {
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
            _console.log.call(this, ...args);
        }
    }
    return lsn;
}
