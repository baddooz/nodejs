let path=require('path')
let fs = require('pn/fs')
let http = require('http')
let request = require('request')
let mkdirp = require('mkdirp')
let argv = require('yargs')
.default('clientdir', '/tmp/VFSClient')
.argv
var tuple = require('tuple');
//var rimraf = require('rimraf')



let server = '127.0.0.1'
let nssocket = require('nssocket')
require('songbird')


var outbound = new nssocket.NsSocket();
outbound.connect(8001,server);


console.log("connected to 8001")

outbound.data('filesync',function (data) {

	let jsondata = JSON.parse(data)

	console.log(jsondata)
	var filePath = jsondata.path 
	if (jsondata.action === 'delete') {
		fs.promise.unlink(argv.clientdir+filePath)
		.then(stat => console.log(argv.clientdir+filePath, ' deleted'))
	}
	else {
		console.log('Downloading the file ', filePath)
		let pathWithoutFileName = path.resolve(path.join(argv.clientdir,filePath.substr(0,filePath.lastIndexOf(path.sep))));
		let localfileName = path.resolve(path.join(pathWithoutFileName,filePath.substr(filePath.lastIndexOf(path.sep)+1)));

		console.log("dir name "  + pathWithoutFileName + " fileName = " + localfileName);
		//async()=>{ await createDir(pathWithoutFileName);}
		createDirRecursively(pathWithoutFileName,1)

		let options = {
			url: 'http://127.0.0.1:8000/'+filePath,
			method:'GET'
		}
		request(options,function (error, response, body) {
			if (!error && response.statusCode == 200) {
		    console.log(body)  
		    let stream =  fs.createWriteStream(localfileName)
		    stream.once('open', function(fd) {
		    	stream.write(body)
		    	stream.end()
		    })
		} else {
			console.log("Oopps");
		}
	})
	}
})

async function createDir(filePath) {
	await mkdirp.promise(filePath);
	console.log("created dir")

}

function createDirRecursively(dirName,index) {
	let dirSep = path.sep;
	if (dirName && dirName.split(dirSep) && dirName.split(dirSep)[index] ) {
		var dir='';
		for (var i=0;i<= index;i++) {
			dir = dir+dirName.split(dirSep)[i]+dirSep;
		}
		fs.access(dir,fs.F_OK).then(createDir(dirName,index+1)).catch( function() {
			fs.mkdir(dir)
			return createDir(dirName,index+1);
		}
		)
	} 
}

