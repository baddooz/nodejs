let fs = require('pn/fs')
let path = require('path')
let lodash = require('lodash')
let {dir} = require('yargs').default('dir', __dirname).argv

async function ls(rootPath){
   try {
     	if(fs.statSync(rootPath).isFile()){
 			return [rootPath]
 		} 
     	let fileNames = await fs.readdir(rootPath)
     	let lspromises = []
     	 for (let fileName of fileNames) {
     	 	let filePath = path.join(rootPath, fileName)
		 	 	 	let promise = ls(filePath)
		    	 	lspromises.push(promise)
    	}
    	return lodash.flatten(await Promise.all(lspromises))

    } catch (e) {
        console.log(e.stack)
    }
}

console.log('executing dir_list function')

ls(dir).then(filePaths => console.log(filePaths))