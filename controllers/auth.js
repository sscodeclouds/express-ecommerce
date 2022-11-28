const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  User.findOne({email})
      .select('name email _id')
      .then(user => {
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save(err => {
            console.log(err)
            res.redirect('/');
        })
      })
      .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
};