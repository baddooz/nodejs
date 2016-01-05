#!/usr/bin/env node

fs = require('pn/fs')


if (process.argv.length < 3) {
    	console.error('Usage: cat.js <file list separated by space>');
    	process.exit(1);
}

for (var i=2;i<process.argv.length;i++) {
	var filename = process.argv[i];
	fs.readFile(filename, function read(err, data) {
	    if (err) {
	        console.log("<"+filename +"> file dont exist")
	    } else {
	    	process.stdout.write(data); 
	    }
	});
}
