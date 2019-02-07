var User = require('../models/user.model');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt'); 
// var config = require('../config/config');

const jwtSecret = process.env.JWT_SECRET || "J@gg!123@09081995Rekh@14041995"

const signin = (req, res) => {
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
      jwtSecret, 
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
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}


module.exports = { signin,
                   signout,
                   requireSignin,
                   hasAuthorization }
