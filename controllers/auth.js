const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const {validationResult} = require('express-validator');
require('dotenv').config();
const User = require('../models/user');
const OAuth2 = google.auth.OAuth2;

const OAuth2Client = new OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
OAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});
const accessToken = OAuth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
    }
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
      message = message[0];
  }else {
      message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
      oldInput: {
          email: '',
          password: ''
      },
      validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    }else {
        message = null;
    }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
      oldInput: {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
      },
      validationErrors: []
  });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    }else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
        oldInput: {
            email: ''
        },
        validationErrors: []
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt : Date.now()}})
        .then(user => {
            if(!user) {
                req.flash('error', 'Link is invalid. Please try again.');
                return res.redirect('/reset');
            }
            let message = req.flash('error');
            if(message.length > 0) {
                message = message[0];
            }else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/reset',
                pageTitle: 'Update Password',
                errorMessage: message,
                token,
                oldInput: {
                    password: '',
                    confirmPassword: ''
                },
                validationErrors: []
            });
        })
        .catch(err => console.log(err))
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: '',
            oldInput: {
                email,
                password
            },
            validationErrors: errors.array()
        });
    }
  User.findOne({email})
    .then(user => {
      bcrypt.compare(password, user.password)
          .then(doMatch => {
              if(doMatch) {
                  req.session.isLoggedIn = true;
                  req.session.user = user;
                  return req.session.save(err => {
                      console.log(err);
                      res.redirect('/');
                  });
              }
              return res.redirect('/login');
          })
          .catch(err => {
              console.log(err);
              req.flash('error', 'Invalid email or password');
              res.redirect('/login')
          })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
      return res.status(422).render('auth/signup', {
          path: '/signup',
          pageTitle: 'Signup',
          errorMessage: '',
          oldInput: {
              name,
              email,
              password,
              confirmPassword: req.body.confirmPassword
          },
          validationErrors: errors.array()
      });
  }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                name,
                email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(() => {
            const mailOptions = {
                from: 'no-reply@expressecom.com',
                to: email,
                subject: 'Congratulations! Your account has been created',
                html: `<p>Hi ${name},</p><p>Your account has been created.</p>`
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    let userName = '';
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            errorMessage: '',
            oldInput: {
                email
            },
            validationErrors: errors.array()
        });
    }
    crypto.randomBytes(32, (err, buffer) => {
       if(err) {
           req.flash('error', 'Error occurred while resetting password');
           return res.redirect('/reset');
       }
       const token = buffer.toString('hex');
       User.findOne({email})
           .then(user => {
               if(!user) {
                   req.flash('error', 'Email does not exist');
                   return res.redirect('/reset');
               }
               userName = user.name;
               user.resetToken = token;
               user.resetTokenExpiration = Date.now() + 3600000;
               return user.save();
           })
           .then(() => {
               const mailOptions = {
                   from: 'no-reply@expressecom.com',
                   to: email,
                   subject: 'Reset Password',
                   html: `
                    <p>Hi ${userName},</p>
                    <p>You requested a password reset.</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `
               };

               transporter.sendMail(mailOptions, function(error, info){
                   if (error) {
                       console.log(error);
                   } else {
                       console.log('Email sent: ' + info.response);
                   }
               });
               res.redirect('/login');
           })
           .catch(err => console.log(err));
    });
};

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const token = req.body.token;
    let user;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            path: '/reset',
            pageTitle: 'Update Password',
            errorMessage: '',
            token,
            oldInput: {
                password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({resetToken: token, resetTokenExpiration: {$gt : Date.now()}})
        .then(userDoc => {
            if(!userDoc) {
                req.flash('error', 'Link is invalid. Please try again.');
                return res.redirect('/reset');
            }
            user = userDoc;
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = null;
                    user.resetTokenExpiration = null;
                    return user.save();
                })
                .then(() => {
                    return res.redirect('/login')
                })
        })
        .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
