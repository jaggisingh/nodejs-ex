const Post = require('../models/post.model');
const _ = require('lodash');
const errorHandler = require('../helper/dbErrorHandler');
const formidable = require('formidable');
const fs = require('fs');

const createPost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    let post = new Post(fields);
    post.recipeBy = req.profile;
    if(files.photo){
      post.photo.data = fs.readFileSync(files.photo.path)
      post.photo.contentType = files.photo.type
    }

    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      res.json(result)
    });

  });
}

const recipeById = (req, res, next, id) => {
  Post.findById(id).populate('recipeBy').exec((err, post) => {
    if (err || !post)
      return res.status('400').json({
        error: "Post not found"
      })
    req.post = post
    next()
  })
}

const listByUser = (req, res) => {
  Post.find({recipeBy: req.profile._id})
    .populate('comments', 'title created')
    .populate('comments.recipeBy', '_id name userImage')
    .populate('recipeBy', '_id name userImage')
    .sort('-created')
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      res.json(posts)
    })
}

const postNewsFeed = (req, res) => {
  let following = req.profile.following
  following.push(req.profile._id)
  Post.find({recipeBy: { $in : req.profile.following } })
    .populate('comments', 'text created')
    .populate('comments.recipeBy', '_id name userImage')
    .populate('recipeBy', '_id name userImage')
    .sort('-created')
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      res.json(posts)
    })
}

const removePost = (req, res) => {
  let post = req.post
  post.remove((err, deletedPost) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(deletedPost)
  })
}

const photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType)
  return res.send(req.post.photo.data)
}

const like = (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {$push: {likes: req.body.userId}}, {new: true})
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
    res.json(result)
  })
}

const unlike = (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {$pull: {likes: req.body.userId}}, {new: true})
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
    res.json(result)
  })
}

const comment = (req, res) => {
  let comment = req.body.comment
  comment.recipeBy = req.body.userId
  Post.findByIdAndUpdate(req.body.postId, {$push: {comments: comment}}, {new: true})
    .populate('comments.recipeBy', '_id name userImage')
    .populate('recipeBy', '_id name userImage')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      res.json(result)
    })
}

const uncomment = (req, res) => {
  let comment = req.body.comment
  Post.findByIdAndUpdate(req.body.postId, {$pull: {comments: {_id: comment._id}}}, {new: true})
    .populate('comments.recipeBy', '_id name userImage')
    .populate('recipeBy', '_id name userImage')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
    res.json(result)
  })
}

const isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.recipeBy._id == req.auth._id
  if(!isPoster){
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

module.exports = {
                    createPost,
                    recipeById,
                    listByUser,
                    postNewsFeed,
                    removePost,
                    photo,
                    like,
                    unlike,
                    comment,
                    uncomment,
                    isPoster
                 }