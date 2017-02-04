Jane = require('./jane/jane.js')

app = Jane()

console.log('app')
console.log(app.connected_hosts)

app.listen(8080)