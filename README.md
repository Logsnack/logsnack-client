# How to use it

```javascript
let logsnack = require('./logsnack-client/logsnack-client.js').default;

if (process.env.NODE_ENV === 'development') {
    let lsn = logsnack('Logsnack-project-name', 'ws://localhost:8090');
    lsn.initialize();
}else{
    console.snack = console.log;
}
console.snack('lsn:err', 'Text log', Math.random(), { 'object': { 'int': 0 }, 'string': 'string' }, ['test'], 1.2);
console.log('lsn:err', 'Text log', Math.random(), { 'object': { 'int': 0 }, 'string': 'string' }, ['test'], 1.2);
```
