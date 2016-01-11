let isLoggedIn = require('../middleware/isLoggedIn')
let blogpost = require('../models/blog')
let then = require('express-then')
let multiparty = require('multiparty')
let fs = require('fs')
let DataUri = require('dataUri')
let multer  = require('multer')



function getDataUri(contentType, data) {
    let image = new DataUri().format('.' + contentType.split('/').pop(), data)
    return `data:${contentType};base64,${image.base64}`
}


module.exports = (app) => {
  let passport = app.passport
  app.use(multer({ dest: './uploads/'}).single('photo'))


  app.get('/', (req, res) => {
    res.render('index.ejs', {message: req.flash('error')})
  })

  app.get('/register', (req, res) => {
    res.render('register.ejs', {message: req.flash('error')})
  })
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }))
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/register',
    failureFlash: true
  }))

  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {
      user: req.user,
      message: req.flash('error')
    })
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.get('/blog/:blogId?', then(async(req, res) =>{
    console.log("blog page")
    let blogId = req.params.blogId
    if (!blogId) {
      //create page
      res.render('blogpage.ejs', {blogpost:{},verb:'Create'})
      return
    }
    let blogpost = await Post.promise.findById(blogId)
    if (!blogpost) res.send(404, 'Not Found')

    res.render('blogpage.ejs', {
        blogpost: blogpost,
        verb: 'Edit',
        image: getDataUri(blogpost.image.contentType, blogpost.image.data)
    })


  }))



//   app.post('/blog/:blogId?', then(async(req, res)=>{
//     console.log("blog submit page")
//     let blogId = req.params.blogId
//     if (!blogId) {
//     //create page
//     let blogPost = new blogpost()
//     console.log("1e " )
//     console.log(' parsed req : ',await new multiparty.Form().promise.parse(req))

//     let [ 
//     {
//       blogname: [blogname],
//       blogdescription:[blogdescription]
//     }
//     , 
//     {
//       image:[file]
//     } 
//     ] = await new multiparty.Form().promise.parse(req)
//         console.log("2e")

//     blogPost.blogname = blogname
//     blogPost.blogdescription = blogdescription
//     blogPost.user = req.user
//     console.log("3e")

//     blogPost.image.data = await fs.promise.readFile(file.path)
//             console.log("4e")

//     blogPost.image.contentType = file.headers['content-type']
//     await blogPost.save()
//     res.redirect('/blog/'+encodeURI(blogname))
//   }
// }))

app.post('/blog/:blogId?',function(req, res) {
  console.log(req.body) // form fields
  console.log(req.files) // form files
  res.end('done')
})
}
