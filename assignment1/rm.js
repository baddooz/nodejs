#!/usr/bin/env babel-node

"use strict";

let fs = require('pn/fs')
let path = require('path')

if (process.argv.length < 3) {
        console.error('Usage: rm.js <file name>');
        process.exit(1);
}

var rootPath = process.argv[2];

async function rm(rootPath)
{
        let lspromises = []
        let data = await fs.stat(rootPath)
        if(data.isFile()){
           console.log("r ... "+rootPath)
           let data = await fs.unlink(rootPath)
        }
        else{
        	 let fileNames =await fs.readdir(rootPath)
             for (let fileName of fileNames) 
             {
                let filePath = path.join(rootPath, fileName)
               await rm(filePath)
            }
            fs.rmdir(rootPath).then(console.log("r ... "+rootPath))
        }
}

rm(rootPath)