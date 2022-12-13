const express = require('express');
const {check, body} = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(user => {
                        if (!user) {
                            return Promise.reject('Email does not exist')
                        }
                    })
            })
            .normalizeEmail(),
        check('password')
            .notEmpty()
            .withMessage('Password is required')
            .trim()
    ],
    authController.postLogin);

router.post('/signup',
    [
        check('name').notEmpty().withMessage('Name is required'),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email exists')
                        }
                        return true;
                    })
            })
            .normalizeEmail(),
        body('password', 'Password must have atleast 5 characters long')
            .isLength({min: 5})
            .trim(),
        body('confirmPassword')
            .custom((value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error('Password does not match');
                }
                return true;
            })
            .trim()
    ],
    authController.postSignup);

router.post('/reset',
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            return User.findOne({email: value})
                .then(user => {
                    if (!user) {
                        return Promise.reject('Email does not exist')
                    }
                    return true;
                })
        })
        .normalizeEmail(),
    authController.postReset);

router.post('/new-password',
    [
        body('password', 'Password must have atleast 5 characters long')
            .isLength({min: 5})
            .trim(),
        body('confirmPassword')
            .custom((value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error('Password does not match');
                }
                return true;
            })
            .trim()
    ],
    authController.postNewPassword);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;