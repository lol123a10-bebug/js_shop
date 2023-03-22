const express = require('express');

const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');
const isLoggedIn = require('../middleware/is-logged-in');

const router = express.Router();

router.get('/login', isLoggedIn, getLogin);

router.post('/login', isLoggedIn, postLogin);

router.get('/signup', isLoggedIn, getSignup);

router.post('/signup', isLoggedIn, postSignup);

router.post('/logout', postLogout);

router.get('/reset', isLoggedIn, getReset);

router.post('/reset', isLoggedIn, postReset);

router.get('/reset/:token', isLoggedIn, getNewPassword);

router.post('/new-password', isLoggedIn, postNewPassword);

module.exports = router;
