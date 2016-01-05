#!/usr/bin/env node
var fs = require('pn/fs')
var path = require('path')
var lodash = require('lodash')
var dir = require('yargs').default('dir', __dirname).argv;

var recursive = process.argv.length > 3 ? process.argv[3] : '';

async function ls(rootPath,option){
   try {
     	if(fs.statSync(rootPath).isFile()){
 			return [rootPath]
 		} 
     	var fileNames = await (fs.readdir(rootPath))
     	if (option == '-R') {
	     	var lspromises = []
	     	 for (var fileName of fileNames) {
	     	 	var filePath = path.join(rootPath, fileName)
			 	var promise = ls(filePath);
			    lspromises.push(promise);
	    	}
	     	return lodash.flatten(await (Promise.all(lspromises)));
     	}
     	else {
     		return [fileNames];
     	}
    	

    } catch (e) {
        console.log(e.stack)
    }
}


ls(dir,recursive).then(function(data){console.log(data)});
