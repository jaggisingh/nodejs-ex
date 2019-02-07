const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: 'Name is required'
  },
  description: {
    type: String,
    required: 'Description is required'
  },
  ingredients: [String],
  // photo: {
  //   data: Buffer,
  //   contentType: String
  // },
  recipeBy: {type: mongoose.Schema.ObjectId, ref: 'User'},
  likes: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  comments: [{
    text: String,
    created: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.ObjectId, ref: 'User'}
  }],
  created: {
    type: Date,
    default: Date.now
  },
  postImage: {
    type: String
  }
})

module.exports =  mongoose.model('Post', PostSchema)