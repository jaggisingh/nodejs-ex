const express = require('express')
const authCtrl = require('../controllers/auth.controller')

const router = express.Router()

router.route('/auth/login')
  .post(authCtrl.signin)
router.route('/auth/logout')
  .get(authCtrl.signout)

module.exports = router