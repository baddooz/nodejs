let isLoggedIn = require('../middleware/isLoggedIn')
let blogpost = require('../models/blog')
let blogcomments = require('../models/blogcomments')

let then = require('express-then')
let multiparty = require('multiparty')
let fs = require('fs')
let DataUri = require('dataUri')
let multer  = require('multer')



function getDataUri(contentType, data) {
  console.log('contentType = ' ,contentType)
  let image = new DataUri().format('.' + contentType.split('/').pop(), data)
  return `data:${contentType};base64,${image.base64}`
}


module.exports = (app) => {
  let passport = app.passport
  app.use(multer({ dest: '/tmp/uploads/'}).single('image'))


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

  app.get('/profile', isLoggedIn, then(async(req, res) => {

   let BlogPosts = await blogpost.promise.find({user: req.user})

   for (let i = 0; i < BlogPosts.length; i++) {
    if (BlogPosts[i].image) {
      BlogPosts[i] = await BlogPosts[i].promise.populate('comments');
      BlogPosts[i].image = getDataUri(BlogPosts[i].image.contentType, BlogPosts[i].image.data)

    }
  }
  res.render('profile.ejs', {
    user: req.user,
    blogposts:BlogPosts,
    message: req.flash('error')
  })
}))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })




app.get('/editblog/:blogId?', then(async(req, res) =>{
    console.log("blog edit  page")
    let blogId = req.params.blogId
    if (!blogId) {
      res.render('blogpage.ejs', {blogpost:{},verb:'Create'})
      return
    }
    let BlogPost = await blogpost.promise.findOne({ $and: [ { user: req.user }, { blogname: blogId }]})

    if (!BlogPost) {
      res.redirect('/')
    } else {

      console.log(" Blog is " , BlogPost)
      BlogPost = await BlogPost.promise.populate('user')
      BlogPost= await BlogPost.promise.populate('comments')


      res.render('blogpage.ejs', {
        blogpost: BlogPost,
        blogname: req.user.blogname,
        verb: 'Edit'
        ,
        image: getDataUri(BlogPost.image.contentType, BlogPost.image.data)
      })
    }


  })) 

  app.get('/blog/:blogId?', then(async(req, res) =>{
    console.log("blog page")
    let blogId = req.params.blogId
    if (!blogId) {
      res.render('blogpage.ejs', {blogpost:{},verb:'Create'})
      return
    }
    let BlogPost = await blogpost.promise.findOne({ $and: [ { user: req.user }, { blogname: blogId }]})

    if (!BlogPost) {
      res.redirect('/')
    } else {

      console.log(" Blog is " , BlogPost)
      BlogPost = await BlogPost.promise.populate('user')
      BlogPost= await BlogPost.promise.populate('comments')


      res.render('viewblog.ejs', {
        blogpost: BlogPost,
        blogname: req.user.blogname,
        verb: 'Edit'
        ,
        image: getDataUri(BlogPost.image.contentType, BlogPost.image.data)
      })
    }


  }))



  app.post('/blog/:blogId?', then(async(req, res)=>{
    let blogId = req.params.blogId
    if (!blogId) {
      let blogPost = new blogpost()

      console.log("user = " ,req.user)

      blogPost.blogname = req.body.blogname
      blogPost.blogdescription =req.body.blogdescription
      blogPost.image = req.file
      blogPost.user = req.user

      blogPost.image.data = await fs.promise.readFile(req.file.path)

      blogPost.image.contentType = req.file.mimetype
      await blogPost.save()
      res.redirect('/blog/'+encodeURI(blogPost.blogname))
    } else {
       let BlogPost = await blogpost.promise.findById(blogId)
        if (!BlogPost) res.send(404, 'Not Found')

      BlogPost.blogname = req.body.blogname
      BlogPost.blogdescription =req.body.blogdescription
      BlogPost.image = req.file
      BlogPost.user = req.user

        //BlogPost.userId = req.user._id
        BlogPost.image.data = await fs.promise.readFile(req.file.path)
        BlogPost.image.contentType = req.file.mimetype
        await BlogPost.save()

        res.redirect('/blog/' + encodeURI(BlogPost.blogname))
    }
  }))

  app.post('/addcomment/:blogId?', then(async(req, res)=>{
    let blogId = req.params.blogId
    let comment = req.body.comment
    console.log('blogId = ',blogId)
    if (!comment || comment.trim().length <= 0) {
      res.redirect('/blog/'+encodeURI(blogId))
    } else {
      let BlogComment = new blogcomments()
      let BlogPost = await blogpost.promise.findById(blogId)
      if (!BlogPost)  {
        res.redirect('/profile')
      } else {
        BlogComment.comment = comment
        BlogComment.blog = BlogPost
        BlogComment.user = req.user
        BlogPost.comments.push(BlogComment)
        await Promise.all([BlogPost.save(), BlogComment.save()])
        res.redirect('/blog/'+encodeURI(BlogPost.blogname))
      }
    }
  }))

     app.get('/deleteblog/:blogId?', then(async(req, res) => {
        let blogId = req.params.blogId
        await blogpost.promise.findByIdAndRemove(blogId)
        res.redirect('/profile')

    }))
}
