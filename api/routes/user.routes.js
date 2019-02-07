const express = require('express');
const router = express.Router();
var User = require('../models/user.model');
const multer = require('multer');
const config = require('../config/config');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
});

const upload = multer({storage : storage});

const authCtrl = require('../controllers/auth.controller')
const userController = require('../controllers/user.controller');

//Create and Get Users
router.route('/api/users')
  .get(authCtrl.requireSignin, userController.userListing)
  .post(userController.createUser)

//Get User Image
router.route('/api/users/photo/:userId')
  .get(userController.photo, userController.defaultPhoto)
router.route('/api/users/defaultphoto')
  .get(userController.defaultPhoto)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userController.read)
  // .put(authCtrl.requireSignin, authCtrl.hasAuthorization, upload.single('image'), userController.userUpdate)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userController.removeUser)

router.route('/api/users/findpeople/:userId')
   .get(authCtrl.requireSignin, userController.findPeople)

//Follow and UnFollow
router.route('/api/users/follow')
  .put(authCtrl.requireSignin, userController.addFollowing, userController.addFollower)
router.route('/api/users/unfollow')
  .put(authCtrl.requireSignin, userController.removeFollowing, userController.removeFollower)

  router.route('/api/jaggi')
        .get(userController.searchIng)

router.param('userId', userController.userByID)

router.put('/api/users/update/:userId', upload.single('userImage'), (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {
    name: req.body.name,
    about: req.body.about,
    userImage: config.baseUrl + req.file.path
  };
 
  User.update({ _id: id }, { $set: updateOps })
      .exec()
      .then(response => {
        res.status(200).json({
          response: response,
          msg: 'User is updated!'
        });
      })
      .catch(err =>  res.status(500).json({error: err}));
 
});

module.exports = router;