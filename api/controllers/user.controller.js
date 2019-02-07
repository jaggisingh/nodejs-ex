var User = require('../models/user.model');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var formidable = require('formidable');
var fs = require('fs');

const errorHandler = require('../helper/dbErrorHandler');
// var profileImage = require('../assets/images/profile-pic.png');
var config = require('../config/config');



const createUser = (req, res, next) => {
  const user = new User(req.body)
  user.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }

    User.findOne({
        "email": req.body.email
      }, (err, user) => {
    
        if (err || !user)
          return res.status('401').json({
            error: "User not found"
          })
    
        if (!user.authenticate(req.body.password)) {
          return res.status('401').send({
            error: "Email and password don't match."
          })
        }
  
        const token = jwt.sign({
            email: user.email,
            _id: user._id
          }, 
          config.jwtSecret,
          { expiresIn: '365d' }
        );
    
        return res.json({
          token,
          user: {
            _id: user._id, 
            name: user.name, 
            email: user.email
          }
      })
    
    })
  })
}

/**
 * Load user and append to req.
 */
const userByID = (req, res, next, id) => {
  User.findById(id)
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, user) => {
      if (err || !user) return res.status('400').json({
        error: "User not found"
      })
      req.profile = user
      next()
  })
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const userListing = (req, res) => {
  User.find((err, users) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(users)
  }).select('name email updated created')
}

const userUpdate = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  console.log(req.body.image, "image")
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }

    console.log(files, "files")
    let user = req.profile;
    user = _.extend(user, fields);
    user.updated = Date.now();

    // if(files.photo){
    //   user.photo.data = fs.readFileSync(files.photo.path)
    //   user.photo.contentType = files.photo.type
    // }

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      user.hashed_password = undefined
      user.salt = undefined
      res.json(user)
    })
  })
}

const removeUser = (req, res, next) => {
  let user = req.profile;

  user.remove((err, deletedUser) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }

    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  })
}

const photo = (req, res, next) => {
  if(req.profile.photo.data){
    res.set("Content-Type", req.profile.photo.contentType)
    return res.send(req.profile.photo.data)
  }
  next()
}

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd()+'profileImage')
}

const addFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId, 
    {$push: {following: req.body.followId}}, 
    (err, result) => 
    {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      next()
    })
}

const addFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId, 
    {$push: {followers: req.body.userId}}, 
    {new: true})
   .populate('following', '_id name')
   .populate('followers', '_id name')
   .exec((err, result) => {
    if (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
    }
    result.hashed_password = undefined
    result.salt = undefined
    res.json(result)
  })
}

const removeFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId, 
    {$pull: {following: req.body.unfollowId}}, 
    (err, result) => 
    {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      next()
    })
}

const removeFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId, 
    {$pull: {followers: req.body.userId}},
    {new: true})
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      result.hashed_password = undefined
      result.salt = undefined
      res.json(result)
  })
}

//Get all users and not in following array and not find me also 
const findPeople = (req, res) => {
  let following = req.profile.following
  following.push(req.profile._id)
  User.find(
    { _id: { $nin : following } }, 
    (err, users) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      res.json(users)
    }).select('name')
}

const searchIng = (req, res) => {
  console.log(req.query.search)
  console.log("serach")
  
  var query = {$text: {$search: req.query.search }};
  User.find(
    query
  ).exec((err, result) => {
      if (err) {
        console.log(err, "err")
        return res.status(400).json({
        })
      }
      console.log(result, "result")
      res.json(result)
  })
}

module.exports = { createUser,
                   userByID,
                   read,
                   userListing,
                   removeUser,
                   userUpdate,
                   photo,
                   defaultPhoto,
                   addFollowing,
                   addFollower,
                   removeFollowing,
                   removeFollower,
                   findPeople,
                   searchIng
                  }
