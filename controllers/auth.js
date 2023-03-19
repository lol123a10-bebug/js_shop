const bcrypt = require('bcryptjs');

const User = require('../models/user');

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

  if (!user) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }

  const doMatch = await bcrypt.compare(password, user.password);

  if (!doMatch) return res.redirect('/login');

  req.session.isLoggedIn = true;
  req.session.user = user;
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  req.session.save((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
};

exports.getSignup = async (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
  });
};

exports.postSignup = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  const userDoc = await User.findOne({ email });

  if (userDoc) return res.redirect('/signup');

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  });

  await user.save();

  res.redirect('/login');
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};
