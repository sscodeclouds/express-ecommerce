const express = require('express');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;