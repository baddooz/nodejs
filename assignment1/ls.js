#!/usr/bin/env node

"use strict";

let fs = require('pn/fs')
let path = require('path')
let _ = require('lodash')

if (process.argv.length < 3) {
        console.error('Usage: ls.js <file name> <options>');
        process.exit(1);
}

var rootPath = process.argv[2]
var param
var recursive = false

if (process.argv.length == 4)
{
    var param = process.argv[3]
    if (param == '-R')
    {
        recursive = false
    }
}


function ls(rootPath, recursive)
{
     try 
     {
        let lspromises = []

        if(fs.statSync(rootPath).isFile())
        {
            console.log(rootPath)
            return [rootPath]
        }
     
        fs.readdir(rootPath).then(function(fileNames)
        {
             for (let fileName of fileNames) 
             {
                let filePath = path.join(rootPath, fileName)
                let promise = ls(filePath, recursive)
                lspromises.push(promise)
            }
        })
        
        return   _.flatten(Promise.all(lspromises))
    } catch (e) {
        console.log(e.stack)
    }
}

ls(rootPath, recursive)