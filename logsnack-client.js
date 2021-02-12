
export default function(tabName, websocketURL){
    let _console = window.console;
    let ws = require('./websocket').default();
    let connected = false;
    let lsn = {
        console: _console,
        replaceConsole(){
            window.console = {
                log : function(){
                    let args = Array.from(arguments);
                    let group = args[0];
                    if(typeof group === "object" && Object.prototype.hasOwnProperty.call(group, 'lsn:group')){
                        args = args.slice(1);
                    }
                    else{
                        group = {'lsn:group' : 'default', 'color': '#1f90ff'};
                    }
                    lsn.log(group, ...args);
                },
                error : function(){
                    lsn.log({'lsn:group' : 'error', 'color': '#ea5b6d'}, ...arguments);
                },
                debug : function(){
                    lsn.log({'lsn:group' : 'debug'}, ...arguments);
                }
            }
        },
        connect(){
            ws.connect(websocketURL);
            ws.send(JSON.stringify({ 'action': 'register', 'name': tabName }));
            connected = true;
        },
        log(group){
            let args = Array.from(arguments);
            if(typeof group === "object" && Object.prototype.hasOwnProperty.call(group, 'lsn:group')){
                args = args.slice(1);
            }
            else{
                group = {'name' : 'default'};
            }
            if(connected){
                let e = new Error();
                let stack = e.stack.split('\n').map(function (line) {
                    return line.trim();
                })
                ws.send(JSON.stringify({ 'action': 'log', 'group': Object.assign({name : group['lsn:group']}, group), 'data': args, 'stack': stack }));
            }else{
                console.log.call(this,  ...args);
            }
        }
    }
    return lsn;
}
