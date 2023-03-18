const express = require('express');

const { getLogin, postLogin, postLogout, getSignup, postSignup } = require('../controllers/auth');
const isLoggedIn = require('../middleware/is-logged-in');

const router = express.Router();

router.get('/login', isLoggedIn, getLogin);

router.post('/login', isLoggedIn, postLogin);

router.get('/signup', isLoggedIn, getSignup);

router.post('/signup', isLoggedIn, postSignup);

router.post('/logout', postLogout);

module.exports = router;
