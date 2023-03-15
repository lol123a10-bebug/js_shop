exports.getLogin = (req, res, next) => {
  console.log(req.session);

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
  });
};

exports.postLogin = (req, res) => {
  req.session.isLoggdenIn = true;
  res.setHeader('Set-Cookie', 'loggedIn=true');
  res.redirect('/');
};
