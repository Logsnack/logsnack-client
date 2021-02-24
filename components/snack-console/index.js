/** * replacerFunc to avoid circular JSON. @from https://careerkarma.com/blog/converting-circular-structure-to-json/ **/
function replacerFunc () {
    let visited = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
        }
        return value;
    };
}

// * Return precise type of passed argument and the preview associated
function getType (arg) {
    //*** 1.Check if type is null because in JS  the following statement is true : typeof null === 'object'
    let type = (arg === null) ? 'null' : typeof arg;

    let typeObject = {
        type: type,
        preciseType: type,
        string: arg
    }

    switch (typeObject.type) {
        case 'object': {
            let matches = Object.prototype.toString.call(arg).match(/\[object\s(?<ptype>.*)\]/);
            if (matches) {
                //? Generate default preview
                typeObject.preciseType = matches.groups.ptype;
                typeObject.preview = typeObject.preciseType;
                if (typeObject.preciseType === 'Object') {
                    let stringObject = JSON.stringify(arg, replacerFunc());
                    let matches = stringObject.match(/(\{|\[)(?<pairs>((.*?,){2})).*?(\}|\])/);
                    if (matches
                        && Object.prototype.hasOwnProperty.call(matches, 'groups')
                        && Object.prototype.hasOwnProperty.call(matches.groups, 'pairs')) {
                        typeObject.preview = `{ ${matches.groups.pairs} ... }`;
                    } else {
                        let length = Object.keys(arg).length;
                        typeObject.preview = `{ ...(${length}) }`;
                    }
                }
                if (typeObject.ptype === 'Array') {
                    typeObject.preview = `[ ...(${arg.length}) ]`;
                }

            }
        }
            break;
        case 'function':
            typeObject.string = "";
            break;
        case 'string':
            typeObject.string.trim();
            break;
    }
    return typeObject;
}

// * Return stack trace
function getTrace () {
    let e = new Error();
    let stack = e.stack.split('\n').map(function (line) {
        return line.trim();
    })
    if (stack.length >= 5) { //? 5 is the depth to get here so 4 is the initial call
        let path = stack[4].replace('webpack-internal:///.', '');
        // let trace = path.match(/.*\s(?<funcname>.*)\s\(.*\/(?<file>.*)(\?.*?){0,1}:(?<line>\d*):(?<col>\d*)\)/);
        let trace = path.match(/.*\/(?<file>.*)(\?.*?){0,1}:(?<line>\d*):(?<col>\d*)/);
        if (trace && Object.prototype.hasOwnProperty.call(trace, 'groups')) {
            return trace.groups;
        }
    }
    return { funcname: null, file: null, line: null, col: null };
}

const JsonViewer = require('../json-viewer/json-viewer').default
require('../json-viewer/scss/types.css');
require('../json-viewer/scss/style.css');
require('./scss/style.css');

let snackConsole = function () {
    const uid = function (prefix) {
        return '_' + prefix + '_' + Math.random().toString(36).substr(2, 9)
    }
    let snacks = [];
    let ready = false;
    window.addEventListener('DOMContentLoaded', function () {
        let lsnModal = document.createElement('div');
        lsnModal.id = 'lsn-modal';
        lsnModal.innerHTML = `<div id="lsn-snackstack"></div>`;
        document.body.appendChild(lsnModal);
        ready = true;
        document.addEventListener('click', function (e) {
            if (e.altKey) {
                let modal = document.getElementById('lsn-modal');
                let root = document.documentElement;
                root.style.setProperty('--lsn-mouse-x', e.clientX + "px");
                root.style.setProperty('--lsn-mouse-y', e.clientY + "px");
                if (modal.classList.contains('lsn-modal-active')) {
                    if (!modal.classList.contains('lsn-modal-desactive')) {
                        modal.classList.remove('lsn-modal-active');
                        modal.classList.add('lsn-modal-desactive');
                        setTimeout(function () {
                            modal.classList.remove('lsn-modal-desactive');
                        }, 333);
                    }
                } else {
                    modal.classList.add('lsn-modal-active');
                }
            }
        });
    });
    return {
        push: function(data){
            let self = this;
            if(ready){
                let snack = {
                    uid: uid('lsn-snack'),
                    data: data,
                    parsed: Object.assign({}, getType(data), getTrace())
                }
                if (snacks.length > 150) {
                    snacks.splice(0, 1);
                }
                snacks.push(snack);
                this.render(snack);
            }
            else{
                setTimeout(function(){
                    self.push(data);
                },150);
            }
        },
        render: function (snack) {
            let container = document.getElementById('logsnack-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'logsnack-container';
                document.body.append(container);
            }
            let snackStackEl = document.getElementById('lsn-snackstack');
            let snackEl = document.createElement('div');
            snackEl.classList.add('lsn-snack');
            //? Create lsn-snack-start
            snackEl.innerHTML = `
                    <div class="lsn-snack-start lsn-type--${snack.parsed.type.toLowerCase()} lsn-type--${snack.parsed.preciseType.toLowerCase()}">
                    ${snack.parsed.string}
                    </div>
                    <div class="lsn-snack-end lsn-type--${snack.parsed.type.toLowerCase()} lsn-type--${snack.parsed.preciseType.toLowerCase()}">${snack.parsed.preciseType}</div>
                    <div class="lsn-snack-end ${!snack.parsed.file ? 'lsn-hidden' : ''}">${snack.parsed.file}:${snack.parsed.line}</div>
                `;
            snackEl.id = snack.uid;
            if (snack.parsed.type === "object") {
                new JsonViewer(snack.data, snackEl.querySelector('.lsn-snack-start'))
            }

            snackStackEl.appendChild(snackEl);
        }
    }
}
export default new snackConsole();
