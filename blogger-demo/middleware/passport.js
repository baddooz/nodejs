let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../user')

const usernameRegEx = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*','g')

module.exports = (app) => {
  let passport = app.passport

  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async (username,password) => {

    console.log('username = ' + username + " password = " + password)
    if (password === '' || username === '' || password.trim() === '' || username.trim() === '') {
      return [false, {message: 'Missing Mandatory field(s)'}]
    }
    //email = email.toLowerCase();
    username = username.trim().toLowerCase();
    let user;
    let fieldtoEval = username.indexOf('@') > 0  ? {'email': username} : username;
    // if (username.indexOf('@') > 0 ) {
    //   console.log('email path')
    //   user = await User.promise.findOne({'email': username})
    //   fieldtoEval = 'email'
    // } else {
    //   console.log('usernmae path')
    //   user = await User.promise.findOne({username})
    // }
    // console.log("user = " , user)
    // if (user) {
    //   console.log("first check = " ,username != user.username)
    //   console.log("seconf check = " , !(fieldtoEval !== undefined  && username === user.email) )
    //   console.log("final check = " ,(username != user.username && !(fieldtoEval !== undefined && username === user.email)))
    // }

    user = await User.promise.findOne({username})
    if (!user) {
       return [false, {message: 'Unknown User'}]
     }

    // if (!user || (username != user.username && !(fieldtoEval !== undefined && username === user.email))) {
    //   return [false, {message: 'Unknown User'}]
    // }

    if (!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password'}]
    }
    return user
  }, {spread: true})))

passport.serializeUser(nodeifyit(async (user) => user._id))
passport.deserializeUser(nodeifyit(async (id) => {
  return await User.promise.findById(id)
}))

passport.use('local-signup', new LocalStrategy({

    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req,email,password) => {
    //return [false, {message: 'Missing Mandatory field(s)'}]
    let {username,blogname,blogdescription} = req.body;
    console.log(" password =  "+password +" email = "+email + " username = " + username +" blogname = " + blogname + " blogdescription = "+blogdescription)
    if (password === '' || username === '' || email === '' || password.trim() == '' || username.trim() === '' || email.trim() === '') {
      return [false, {message: 'Missing Mandatory field(s)'}]
    }
    username = username.trim()
    if (username.length <=4 || usernameRegEx.test(username) == false) {
      console.log("username = "+username+" len = " + username.length + " valid? " + usernameRegEx.test(username))
      return [false, {message: 'Username: Minimum length: 4 ,at least 1 uppercase, 1 lowercase and a number'}]
    }
    username = username.toLowerCase()
    if (await User.promise.findOne({username})) {
      return [false, {message: 'That username is already taken.'}]
    }

      // create the user
      let user = new User()
      user.username = username
      user.email = email
      user.password = await user.generateHash(password)
      user.blogname = blogname
      user.blogdescription = blogdescription
      try {
        return await user.save()
      } catch(e) {
        return [false,{message: e.message}]
      }
      
    }, {spread: true})))
}
