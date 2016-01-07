let express = require('express')
let then = require('express-then')
require('songbird')
let morgan = require('morgan')
let trycatch = require('trycatch')
let crud = require('./routes/crud')
//var bodyParser = require('body-parser')


async function initialize(port) {
 let app = express()

    // Morgan provides HTTP logging
    app.use(morgan('dev'))

    // Use trycatch to send 500s and log async errors from requests
    app.use((req, res, next) => {
        trycatch(next, e => {
            console.log(e.stack)
            res.writeHead('500')
            res.end('500')
        })
    })
    //app.use( bodyParser.json() );       // to support JSON-encoded bodies
    //app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
     //   extended: true
    //})); 
app.use('/', crud);
app.set('view engine', 'jade');
await app.promise.listen(port)

    console.log(`LISTENING @ http://127.0.0.1:${port}`)
    //app.all('*', (req, res) => res.end('hello\n'))

}



module.exports = {initialize}