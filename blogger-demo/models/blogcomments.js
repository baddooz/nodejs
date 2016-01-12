let mongoose = require('mongoose')

let BlogCommentsSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('blogcomments', BlogCommentsSchema)
