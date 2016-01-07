var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('pn/fs')


/* GET home page. */
router.get('/*', function(req, res, next) {
VFSServer(req,res,next,false,false);
});

async function VFSServer(req,res,next,isUpdate,isDelete) {
	let filePath = getFilePath(req);
	let exists = await fs.exists(filePath)
	let data1;
	if (exists && isDelete) {
		data1 = await deleteFile(filePath);
	} else {
		if (isUpdate) {
			req.pipe(process.stdout);
			data1 =  updateFile(filePath,req);
		}  else {
			if (exists) { 
			 	data1 = await readFile(filePath);
			 } else { 
			  	data1 = await writeFile(filePath);
		  	}
		}
	}
	
	res.end(data1+"");
}



async function readFile(filePath) {	
		return  await fs.promise.readFile(filePath);
}

function writeFile(filePath) {
	console.log("my filepath = " + filePath);
	fs.open(filePath,"w");
	return 'created '+ filePath;
}

function updateFile(filePath,req) {
	console.log("my update content = ", req.body);
	fs.unlink(filePath);
	return 'updated: '+ filePath;
}

async function deleteFile(filePath) {
	console.log('deleting: '+ filePath);
	await fs.unlink(filePath);
	return 'deleted: '+ filePath;
}

router.post('/*', function(req, res, next) {
	VFSServer(req,res,next,true,false);
});

router.put('/*', function(req, res, next) {
	VFSServer(req,res,next,true,false);
});

router.delete('/*', function(req, res, next) {
	VFSServer(req,res,next,false,true);
});

function getFilePath(req) {
	var filename = req.url.substr(req.url.indexOf('/',1)+1,req.url.length);
	return path.join(__dirname, '/../files', filename);
}
module.exports = router;