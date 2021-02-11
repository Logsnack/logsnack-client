#How to use it

```javascript
let logsnack = require('./logsnack-client/logsnack-client.js').default;
let lsn = logsnack('My-app-name', 'ws://localhost:8090');
lsn.connect();
lsn.replaceConsole();
console.error({'lsn:group' : 'my-first-group', 'color': '#ea5b6d'}, 'Text log', Math.random(), {'object': {'int': 0}, 'string': 'string'}, ['test'],1.2);
console.log({'lsn:group' : 'my-second-group', 'color': '#ffc300'}, 'Text log', Math.random(), {'object': {'int': 0}, 'string': 'string'}, ['test'],1.2);
```
