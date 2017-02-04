const express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  environment = require('../../config/environment'),
  User = require('../models/user');

/**
 * The auth router function receives a configured passport reference
 * and returns the auth routes. 
 * @param {any} passport
 * @returns {any} a router instance
 */
module.exports = (passport) => {

  router.get('/profile', (req, res, next) => {
    let token = req.query.token;

    User.findOne({ token: token }, function (err, user) {
      if (err) { return res.status(401).json(err); }
      if (!user) { return res.status(400).json({ "message": "user not found", token: token }) }
      //return done(null, user, { scope: 'all' });
      res.json(user);
    });
  });


  // LOGOUT ==============================
  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // process the login form
  router.post('/login', (req, res, next) => {
    passport.authenticate('local-login',
      (err, user, info) => {
        if (!user) {
          res.status(400).json({ message: info });
          return;
        }
        let token = jwt.sign(user.toObject(), environment.secretKey, {
          expiresIn: environment.tokenValidityTime
        });
        res.send({ user: user.id, jwtToken: token });

      })(req, res, next);
  });

  // Token Authentication Test
  router.get('/tokenTest', passport.authenticate('jwt', { session: false }),
    function (req, res) {
      res.json({message: 'The token authentication is working. ', user: req.user} );
    });

  // SIGNUP =================================

  // process the signup form
  router.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup',
      (err, user, info) => {
        if (!user) {
          res.status(400).json({ message: info });
          return;
        }
        let token = jwt.sign(user.toObject(), environment.secretKey, {
          expiresIn: environment.tokenValidityTime
        });
        res.json({
          id: user.id,
          token: token
        });
        return;
      })(req, res, next);
  });

  // facebook -------------------------------

  // send to facebook to do the authentication
  router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

  // handle the callback after facebook has authenticated the user
  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // twitter --------------------------------

  // send to twitter to do the authentication
  router.get('/twitter', passport.authenticate('twitter', { scope: 'email' }));

  // handle the callback after twitter has authenticated the user
  router.get('/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // the callback after google has authenticated the user
  router.get('/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally --------------------------------
  router.get('/connect/local', function (req, res) {
    res.render('connect-local.ejs', { message: 'loginMessage' });
  });
  router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local' // redirect back to the signup page if there is an error
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  router.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

  // handle the callback after facebook has authorized the user
  router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // twitter --------------------------------

  // send to twitter to do the authentication
  router.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

  // handle the callback after twitter has authorized the user
  router.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  router.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

  // the callback after google has authorized the user
  router.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  router.get('/unlink/local', function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  // facebook -------------------------------
  router.get('/unlink/facebook', function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  // twitter --------------------------------
  router.get('/unlink/twitter', function (req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  // google ---------------------------------
  router.get('/unlink/google', function (req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  return router;

};