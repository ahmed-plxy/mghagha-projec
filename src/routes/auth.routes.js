const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { requireGuest } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');
const env = require('../config/env');

router.get('/login', requireGuest, authController.showLogin);
router.post('/login', requireGuest, loginLimiter, authController.login);
router.get('/register', requireGuest, authController.showRegister);
router.post('/register', requireGuest, registerLimiter, authController.register);
router.post('/logout', authController.logout);

router.get('/complete-profile', authController.showCompleteProfile);
router.post('/complete-profile', authController.completeProfile);

if (env.googleClientId && env.googleClientSecret) {
  router.get('/google', requireGuest, passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login?error=google' }),
    authController.googleCallback
  );
}

module.exports = router;
