let mongoose = require('mongoose')
let crypto = require('crypto')

require('songbird')

const SALT='unknown'

let userSchema = mongoose.Schema({
  email: {
  	type: String,
  	required: true},
  password: {
  	type: String,
  	required: true},
  username: {
  	type: String,
  	required: true},
  blogname: {
  	type: String,
  	required: false},
  blogdescription: {
  	type: String,
  	required: false}
})

userSchema.methods.generateHash = async function(password) {
  let passHash =  (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
  return passHash;
}

userSchema.methods.validatePassword = async function(password) {
	let passHash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
	return (passHash === this.password)
}

module.exports = mongoose.model('User', userSchema)
