/** replacerFunc to avoid circular JSON. @from https://careerkarma.com/blog/converting-circular-structure-to-json/ **/
const replacerFunc = function(){
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
function getTypeOf (arg) {
    let res = {
        type: typeof arg,
        ptype: typeof arg,
        preview: arg
    }

    switch(res.type){
        case 'object': {
            let matches = Object.prototype.toString.call(arg).match(/\[object\s(?<ptype>.*)\]/);
            if (matches) {
                res.ptype = matches.groups.ptype;
                res.preview = res.ptype;
                if (res.ptype === 'Object') {
                    let length = Object.keys(arg).length;
                    res.preview = `{ ...(${length}) }`;
                }
                if (res.ptype === 'Array') {
                    res.preview = `[ ...(${arg.length}) ]`;
                }

            }
        }
        break;
        case 'function':
            res.preview = "";
            break;
        case 'string':
            res.preview.trim();
            break;
    }
    return res;
}
function createEntry(key, value, deep){
    let entryContainerElement = document.createElement('div');
    let type = getTypeOf(value);
    // let id = '_' + Math.random().toString(36).substr(2, 9);
    entryContainerElement.classList.add('lsn-json-entry-container')
    entryContainerElement.style.marginLeft = (8*(deep))+'px';
    let entryElement = document.createElement('div')
    let entryChildrenElement = document.createElement('div')
    entryElement.classList.add(`lsn-type--${type.type.toLowerCase()}`)
    entryElement.classList.add(`lsn-type--${type.ptype.toLowerCase()}`)
    entryChildrenElement.classList.add('lsn-json-entry--children');
    entryElement.classList.add('lsn-json-entry');
    entryElement.innerHTML = `
                    <div class="lsn-json-entry-left">${key}</div>
                    <div class="lsn-json-entry-center">${type.preview}</div>
                    <div class="lsn-json-entry-right"> ${type.ptype}</div>
        `;

    if((type.type.toLowerCase() === 'object' || type.ptype === 'Array') && deep < 10){
        entryElement.addEventListener('click', function(e){
            if(!entryElement.classList.contains('lsn-rendered')){
                render(value, entryChildrenElement, deep);
                entryElement.classList.add(('lsn-rendered'));
            }
            else{
                if(!entryContainerElement.classList.contains('lsn-hidden')){
                    entryContainerElement.classList.add('lsn-hidden')
                }
                else{
                    entryContainerElement.classList.remove('lsn-hidden')
                }
            }
            e.stopPropagation();
            e.preventDefault();
        })
    }
    entryContainerElement.appendChild(entryElement);
    entryContainerElement.appendChild(entryChildrenElement);
    return entryContainerElement;
}
function render (data, container, i){
    i++;
    let keys = Object.keys(data).sort( (a, b) => a.localeCompare(b, 'en', {ignorePunctuation: false}));
    for (const key of keys) {
        let entryContainerElement = createEntry(key, data[key], i);
        container.appendChild(entryContainerElement);
    }
}
export default function (data, container) {
    // let data = JSON.parse(_data);
    container.innerHTML = "";
    let viewerElement = document.createElement('div');
    viewerElement.classList.add('lsn-json-viewer');
    // render(data, viewerElement, 0);
    let entryContainerElement = createEntry('Object', data, 0);
    viewerElement.appendChild(entryContainerElement);
    container.appendChild(viewerElement);
}


