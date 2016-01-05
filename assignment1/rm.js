#!/usr/bin/env node

"use strict";

let fs = require('pn/fs')
let path = require('path')

if (process.argv.length < 3) {
        console.error('Usage: rm.js <file name>');
        process.exit(1);
}

var rootPath = process.argv[2];

function rm(rootPath)
{
        let lspromises = []
        fs.stat(rootPath).then(function (data){
        if(data.isFile()){
           console.log("r ... "+rootPath)
             fs.unlink(rootPath).then(console.log("r ..."+rootPath))
        }
        else{
         fs.readdir(rootPath).then(function(fileNames){
             for (let fileName of fileNames) 
             {
                let filePath = path.join(rootPath, fileName)
                let promise =  rm(filePath)
            }
               fs.rmdir(rootPath).then(console.log("r ... "+rootPath))
        })}})
}

rm(rootPath)