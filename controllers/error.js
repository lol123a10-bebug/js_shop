exports.get404 = (req, res) => {
  res.status(404).render('404', { pageTitle: 'Page not found', path: '/404', isAuthenticated: req.isLoggedIn });
};
