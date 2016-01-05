#!/usr/bin/env node

fs = require('pn/fs')
var dirSep = '/';


if (process.argv.length < 3) {
    	console.error('Usage: mkdir.js <dirname to create>');
    	process.exit(1);
}

var index = process.argv[2].startsWith(dirSep) ? 1:0;
createDir(process.argv[2],index);

function createDir(dirName,index) {
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


