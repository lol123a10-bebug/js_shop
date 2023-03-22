const express = require('express');
const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');

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
const User = require('../models/user');

const router = express.Router();

router.get('/login', isLoggedIn, getLogin);

router.post(
  '/login',
  isLoggedIn,
  [
    body('email', 'Enter correct email.')
      .isEmail()
      .custom(async (email) => {
        const user = await User.findOne({ email });

        if (!user) throw new Error("Email doesn't exist");

        return true;
      }),
    body('password').custom(async (password, { req }) => {
      const user = await User.findOne({ email: req.body.email });

      const doMatch = await bcrypt.compare(password, user.password);

      if (!doMatch) {
        throw new Error('Incorrect password.');
      }

      return true;
    }),
  ],
  postLogin
);

router.get('/signup', isLoggedIn, getSignup);

router.post(
  '/signup',
  isLoggedIn,
  [
    check('email')
      .isEmail()
      .withMessage('Please enter valid email.')
      .custom(async (email, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden.');
        // }

        // return true;

        const userDoc = await User.findOne({ email });

        if (userDoc) {
          throw new Error('Email already exists, please pick another one.');
        }

        return true;
      }),

    body('password', 'Please enter a password with only numbers and text at least 4 characters.')
      .isLength({ min: 4 })
      .isAlphanumeric(),

    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match.');
      }

      return true;
    }),
  ],

  postSignup
);

router.post('/logout', postLogout);

router.get('/reset', isLoggedIn, getReset);

router.post('/reset', isLoggedIn, postReset);

router.get('/reset/:token', isLoggedIn, getNewPassword);

router.post('/new-password', isLoggedIn, postNewPassword);

module.exports = router;
