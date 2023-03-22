const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  mailjetTransport({
    auth: {
      apiKey: process.env.maject_api_key,
      apiSecret: process.env.maject_api_secret,
    },
  })
);

exports.getLogin = (req, res, next) => {
  const [message] = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  req.session.save((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
};

exports.getSignup = async (req, res) => {
  const [message] = req.flash('error');

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {},
  });
};

exports.postSignup = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  });

  await user.save();

  res.redirect('/login');

  transporter
    .sendMail({
      to: email,
      from: 'soulbuster321@gmail.com',
      subject: 'Signup succeeded',
      html: '<h1>You successfully signed up!</h1>',
    })
    .catch(console.log);
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res) => {
  const [message] = req.flash('error');

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res) => {
  crypto.randomBytes(32, async (err, buff) => {
    if (err) {
      console.error(err);
      return res.redirect('/auth/reset');
    }

    const token = buff.toString('hex');

    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        req.flash('error', 'No account with that email was found.');
        return res.redirect('/reset');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600 * 1000;
      await user.save();

      res.redirect('/');

      transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Passowrd reset',
        html: /* html */ `
          <p>You requested a password reset</p>
          <p>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to set a new password.</p>
        `,
      });
    } catch (err) {
      console.log(err);
    }
  });
};

exports.getNewPassword = async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  });

  const [message] = req.flash('error');

  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage: message,
    userId: user._id.toString(),
    passwordToken: token,
  });
};

exports.postNewPassword = async (req, res) => {
  const { password: newPassword, userId, passwordToken } = req.body;

  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!user) {
      req.flash('error', 'Incorrect token');
      return res.redirect(`/reset/${passwordToken}`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.redirect('/login');
  } catch (err) {
    console.log(err);
  }
};
