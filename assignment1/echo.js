#!/usr/bin/env node


if (process.argv.length < 3) {
    	console.error('Usage: echo.js <message>');
    	process.exit(1);
}

var msg='';
for (var i=2;i<process.argv.length;i++) {
msg = msg + ' '+ process.argv[i];
}
console.log(msg);
