let mongoose = require('mongoose')

require('songbird')


let blogSchema = mongoose.Schema({
  blogname: {
  	type: String,
  	required: true},
  blogdescription: {
  	type: String,
  	required: true},
  	image:{
  		data: Buffer,
  		contentType: String
  	},
  	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('blog', blogSchema)
