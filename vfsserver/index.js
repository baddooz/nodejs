let trycatch = require('trycatch')
let main = require('./main')
let crud = require('./routes/crud')

// These will help us with troubleshooting
trycatch.configure({'long-stack-traces': true})
//process.on('uncaughtException', functiondd)
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
process.on('unhandledRejection', function(err) {
  console.log('Caught exception: ' + err);
});

main.initialize(8000).catch(e => console.log(e.stack))