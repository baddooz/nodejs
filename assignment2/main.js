let express = require('express')
let then = require('express-then')
var fs = require('fs');
let path = require('path')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let rimraf = require('rimraf')
let mime = require('mime-types')
let mkdirp = require('mkdirp')
let yargs = require('yargs')
require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT
const ROOT_DIR = process.argv.length > 3 ? process.argv[2] : '/tmp/VFS'

let app = express()

if ( NODE_ENV != 'prod') {
  app.use(morgan('dev'))
}

app.set('view engine', 'jade');
app.listen(8000)
console.log(`LISTENING @ http://127.0.0.1:8000`)
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
      fs.createReadStream(req.filePath,res.body);
  });

app.post('*',setFileMeta, setDirDetails,(req,res,next)=> {
  async()=> {
    if(!req.stat) return res.send(405,'File does not exist')
      if(req.isDir) return res.send(405,'Path is a directory')
        await fs.promise.truncate(req.filePath,0)
      req.pipe(fs.createWriteStream(req.filePath))
      res.end()
    }
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

  if (req.stat) return res.send(405,'File exists')
    let filePath = req.filePath
  let endsWith = filePath.charAt(filePath.length-1) === path.sep
  let hasExt = path.extname(req.filePath) !== ''
  req.isDir = endsWith  || !hasExt
  req.dirPath = req.isDir ? filePath : path.dirname(filePath);
  console.log("filePath = "+ filePath + " length = "+filePath.length+" char at = "+filePath.charAt(filePath.length-1))


  next()
}

function sendHeaders(req,res,next) {
  nodeify( async ()=> {
    console.log("sendHeaders req.stat = ",req.stat)
    if (req.stat && req.stat.isDirectory()) {
      let files = await fs.promise.readdir(req.filePath)
      res.body = JSON.stringify(files)
      res.setHeader('Content-Length',res.body.length)
      //let contentType = mime.content
      res.setHeader('Content-Type', 'application/json')
      return
    }
    if (req.stat) res.setHeader('Content-Length',req.stat.size)
      let contentType = mime.contentType(path.extname(req.filePath))
    res.setHeader('Content-Type',contentType)
  }(),next)
}