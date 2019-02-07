const express = require('express');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const postCtrl = require('../controllers/post.controller');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../config/config');
const Post = require('../models/post.model');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
});

const upload = multer({storage : storage});



// router.route('/api/posts/new/:userId')
//   .post(authCtrl.requireSignin, postCtrl.createPost)

router.route('/api/posts/photo/:postId')
  .get(postCtrl.photo)

//Post by me 
router.route('/api/posts/by/:userId')
  .get(authCtrl.requireSignin, postCtrl.listByUser)

router.route('/api/posts/feed/:userId')
  .get(authCtrl.requireSignin, postCtrl.postNewsFeed)

router.route('/api/posts/like')
  .put(authCtrl.requireSignin, postCtrl.like)
router.route('/api/posts/unlike')
  .put(authCtrl.requireSignin, postCtrl.unlike)

router.route('/api/posts/comment')
  .put(authCtrl.requireSignin, postCtrl.comment)
router.route('/api/posts/uncomment')
  .put(authCtrl.requireSignin, postCtrl.uncomment)

router.route('/api/posts/:postId')
  .delete(authCtrl.requireSignin, postCtrl.isPoster, postCtrl.removePost)

router.param('userId', userCtrl.userByID)
router.param('postId', postCtrl.recipeById)


router.post('/api/posts/new/:userId', upload.single('postImage'), (req, res, next) => {
 
  const post = new Post({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    description: req.body.description,
    recipeBy: req.params.userId,
    ingredients: req.body.ingredients,
    postImage: config.baseUrl + req.file.path
  });

  post.save().then(response => {
    res.status(201).json({
      msg: "Post successfully uploaded!",
      response: response
    });
  }).catch(err => {
      res.status(500).json({
          error: err,
          msg: 'error in Post'
      });  
  }); 
 
});

module.exports =  router
