let mongoose = require('mongoose')

let BlogCommentsSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('blogcomment', BlogCommentsSchema)
