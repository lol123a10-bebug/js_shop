const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggdenIn,
  });
};

exports.postLogin = async (req, res) => {
  const user = await User.findById('640f739f2dd07e39c9c0646c');

  req.session.isLoggdenIn = true;
  req.session.user = user;
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  req.session.save((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};
