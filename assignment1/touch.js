#!/usr/bin/env node

fs = require('pn/fs')


if (process.argv.length < 3) {
    	console.error('Usage: touch.js <file list separated by space>');
    	process.exit(1);
}

	var filename = process.argv[2];
	fs.exists(filename,function (exists) {
	    if (exists) {
	    	var currentTime = new Date();
	        fs.utimesSync(filename,currentTime,currentTime);
	    } else {
	    	fs.open(filename,"w");
	    }
	});
