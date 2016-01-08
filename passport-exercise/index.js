let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
// Add to top of index.js with other requires
let crypto = require('crypto')
let SALT = 'peppersalt'
let flash = require('connect-flash')
let mongoose = require('mongoose')
let User = require('./user')

mongoose.connect('mongodb://127.0.0.1:27017/authenticator')

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()
app.use(flash())


app.set('view engine', 'ejs')
app.use(cookieParser('profcookie'))            
// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// In-memory session support, required by passport.session()
app.use(session({
  secret: 'profcookie',
  resave: true,
  saveUninitialized: true
}))

// Use the passport middleware to enable passport
app.use(passport.initialize())

// Enable passport persistent sessions
app.use(passport.session())

app.get('/', (req, res) => {
    res.render('index.ejs', {message: req.flash('error')})
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next()
    res.redirect('/')
}
app.get('/profile', isLoggedIn, (req, res) => res.render('profile.ejs', {}))
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// let user = {
//     email: 'foo@foo.com',
//     password: crypto.pbkdf2Sync('asdf', SALT, 4096, 512, 'sha256').toString('hex')
// }

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))


passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true
}, nodeifyit(async (email, password) => {
    email = (email || '').toLowerCase()
    if (!email) {
        return [false, {message: 'Invalid username'}]
    }
    if (!password) {
       return [false, {message: 'Invalid password'}]
   }
    let user = await User.promise.findOne({email});
    if (user) {
         let passwordHash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex')
         if (user.password === passwordHash) {
         	return user;
         } else {
         	return [false, {message: 'Invalid password'}]
         }
    } 
    return [false, {message: 'Invalid Credentials'}]
}, {spread: true})))

passport.use('local-signup', new LocalStrategy({
   // Use "email" field instead of "username"
   usernameField: 'email'
}, nodeifyit(async (email, password) => {
    email = (email || '').toLowerCase()
    // Is the email taken?
    if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken.'}]
    }

    // create the user
    let user = new User()
    user.email = email
    // Use a password hash instead of plain-text
    user.password = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex')
    return await user.save()
}, {spread: true})))

passport.deserializeUser(nodeifyit(async (email) => {
    return await User.findOne({email}).exec()
}))
passport.deserializeUser(nodeifyit(async (id) => user))

passport.serializeUser(nodeifyit(async (user) => user.email))


// start server 
app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))