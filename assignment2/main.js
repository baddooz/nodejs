let express = require('express')
let then = require('express-then')
var fs = require('fs');
let path = require('path')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let rimraf = require('rimraf')
let mime = require('mime-types')
let mkdirp = require('mkdirp')
let argv = require('yargs')
.default('dir', '/tmp/VFS')
.argv

require('songbird')
let chokidar = require('chokidar')
let nssocket = require('nssocket')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = argv.dir
const TCP_PORT = 8001


let app = express()

if ( NODE_ENV != 'prod') {
  app.use(morgan('dev'))
}

app.set('view engine', 'jade');
app.listen(PORT)
console.log(`LISTENING @ http://127.0.0.1:{PORT}`)
console.log('My root dir is: ',ROOT_DIR)
app.head('*', setFileMeta,sendHeaders,(req,res) => res.end());

app.get('*', 
  setFileMeta,
  sendHeaders,
  (req,res) => {
    if(res.body){
      res.json(res.body); 
      return;
    }
    if(!req.stat) return res.send(400,'Invalid path')
      fs.createReadStream(req.filePath).pipe(res);
  });

app.post('*',setFileMeta, setDirDetails,(req,res,next)=> {
  async()=> {
    if(!req.stat) {
      res.send(405,'File does not exist');
      return;
    } 
    if(req.isDir) { 
      res.send(405,'Path is a directory')
      return;
    }
      await fs.promise.truncate(req.filePath,0)
      console.log('dir created');
      req.pipe(fs.createWriteStream(req.filePath))
      console.log('file is  updated');
      res.end()
    }().catch();
  });
app.put('*',setFileMeta, setDirDetails,(req,res,next)=> { 
  async()=> {

   if(req.stat) {
     res.send(405,'File exists')
     return;
   } else {
     await mkdirp.promise(req.dirPath)
     if(!req.isDir) {req.pipe(fs.createWriteStream(req.filePath))
      res.end();}

    }
  }().catch(next)
});

app.delete('*',setFileMeta, (req,res,next)=> {
  async()=> {
    if(!req.stat) return res.send(400,'Invalid path')
      if (req.stat.isDirectory()) {

        await rimraf.promise(req.filePath)
      } else await fs.promise.unlink(req.filePath)
      res.end()
    }().catch(next)
  });


// listening for clients
var sockets = [];
var server = nssocket.createServer(
  function (socket) {
    sockets.push(socket);
    console.log("total no of socktes to broadcast = " + sockets.length);
    socket.data('Connecting', function (data) {
      for(var i=0, l=sockets.length; i<l; i++) {
        sockets[i].send('Broadcasting', 'data');
      }
    });
  }
  ).listen(TCP_PORT);

console.log(`LISTENING ${TCP_PORT} for Dropbox Clients`)

let watcher = chokidar.watch(ROOT_DIR, {ignored: /[\/\\]\./,ignoreInitial: true})


// Add event listeners. 
watcher
.on('add', path => broadCastData('write', false, path))
.on('addDir',path => broadCastData('addDir', false, path))
.on('change', path => broadCastData('write', false, path))
.on('unlink', path => broadCastData('delete', false, path));

function broadCastData(action, dir, path)
{
  let strippedpath = path.substr(ROOT_DIR.length);
  console.log("stripped path = ",strippedpath);
  let jsonString = '{ "action": "' + action + '","path":'
  jsonString = jsonString +  '"' + strippedpath + '","type": "'
  jsonString = jsonString + dir + '"}'

  for(var i=0, l=sockets.length; i<l; i++) {
    sockets[i].send('filesync', jsonString);

  }
  console.log(" sent ")
}

function setFileMeta(req,res,next) {

  req.filePath = path.resolve(path.join(ROOT_DIR,req.url))
  console.log('am in setFileMeta PATH = ',req.filePath);

  if (req.filePath.indexOf(ROOT_DIR) !== 0) {
    res.send(400,'invalid path')
    return
  }
  fs.promise.stat(req.filePath).then(stat=>req.stat=stat, ()=> req.stat=null).nodeify(next)
}

function setDirDetails(req,res,next) {

  //if (!req.stat) return res.send(405,'File exists')
  let filePath = req.filePath
  let endsWith = filePath.charAt(filePath.length-1) === path.sep
  let hasExt = path.extname(req.filePath) !== ''
  req.isDir = endsWith  || !hasExt
  req.dirPath = req.isDir ? filePath : path.dirname(filePath);
 // console.log("filePath = "+ filePath + " length = "+filePath.length+" char at = "+filePath.charAt(filePath.length-1))
  next()
}

function sendHeaders(req,res,next) {
  nodeify( async ()=> {
    //console.log("sendHeaders req.stat = ",req.stat)
    if (req.stat && req.stat.isDirectory()) {
      //console.log("its a dir")
      let files = await fs.promise.readdir(req.filePath)
      res.body = JSON.stringify(files)
      res.setHeader('Content-Length',res.body.length)
      res.setHeader('Content-Type', 'application/json')
      return
    }
    if (req.stat) res.setHeader('Content-Length',req.stat.size)
    let contentType = mime.contentType(path.extname(req.filePath))
    res.setHeader('Content-Type',contentType)
    console.log("done sendHeaders");
  }(),next)
}