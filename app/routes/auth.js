const express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  environment = require('../../config/environment');

/**
 * The auth router function receives a configured passport reference
 * and returns the auth routes. 
 * @param {any} passport
 * @returns {any} a router instance
 */
module.exports = (passport) => {


  /**
   * Utility for generating a JWT token and binding it to a user.
   * @param {any} user
   */
  let generateToken = (user) => {
    return jwt.sign(user.toObject(), environment.secretKey, {
      expiresIn: environment.tokenValidityTime
    });
  };


  /***********************************************************************
   * LOCAL STRATEGY ROUTES 
   ***********************************************************************/

  // process the login form
  router.post('/login', (req, res, next) => {
    passport.authenticate('local-login',
      (err, user, info) => {
        if (!user) {
          res.status(400).json({ message: info });
          return;
        }

        res.send({ user: user.id, token: generateToken(user) });

      })(req, res, next);
  });

  // Request profile
  router.get('/profile', passport.authenticate('jwt', { session: false }),
    function (req, res) {
      res.json({ user: req.user });
    });

  // Log out
  router.get('/logout', passport.authenticate('jwt', { session: false }),
    function (req, res) {
      req.logout();
      res.json({ message: "Logged out" });
    });

  // Sign up
  router.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup',
      (err, user, info) => {
        if (!user) {
          res.status(400).json({ message: info });
          return;
        }
        res.json({
          id: user.id,
          token: generateToken(user)
        });
        return;
      })(req, res, next);
  });

  // Connect (when already logged in using a different strategy).
  router.post('/connect/local',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      passport.authenticate('local-signup',
        (err, user, info) => {
          if (!user) {
            res.status(400).json({ message: info });
            return;
          }
          res.json({
            id: user.id,
            token: generateToken(user)
          });
          return;
        })(req, res, next);
    });

  /***********************************************************************
   * GOOGLE STRATEGY ROUTES 
   ***********************************************************************/

  router.get('/google/callback', (req, res, next) => {
    // After a successful login, an auth token is generated and retrieved to 
    // the client app.
    passport.authenticate('google', (err, user, info) => {
      res.redirect(environment.clientAuth + generateToken(user));
    })(req, res, next);

  });

  // send to google to do the authentication
  router.get('/google', passport.authenticate('google',
    {
      scope: ['profile', 'email']
    }));

  // Google connect. In this case, a session must be kept for us to know
  // which was the user once google redirects to the callback after the
  // authorization.
  router.get('/connect/google', passport.authenticate('jwt', { session: true }), passport.authorize('google', { scope: ['profile', 'email'] }));

  // Google connect callback
  router.get('/connect/google/callback', (req, res, next) => {
    // After a successful login, an auth token is generated and retrieved to 
    // the client app.
    passport.authenticate('google', (err, user, info) => {
      res.redirect(environment.clientAuth + generateToken(user));
    })(req, res, next);

  });

  // Unlink google from the current profile
  router.get('/unlink/google',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      var user = req.user;
      user.google.token = undefined;
      user.save(function (err) {
        res.json({ message: "success" });
      });
    });


  /***********************************************************************
   * FACEBOOK STRATEGY ROUTES 
   ***********************************************************************/

  // Send to facebook to do the authentication
  router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

  // Handle the callback after facebook has authenticated the user
  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // Send to facebook to do the authentication
  router.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

  // Handle the callback after facebook has authorized the user
  router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // Unlink facebook
  router.get('/unlink/facebook', function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  /***********************************************************************
   *  TWITTER STRATEGY ROUTES 
   ************************************************************************/

  // Send to twitter to do the authentication
  router.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

  // Handle the callback after twitter has authorized the user
  router.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // Send to twitter to do the authentication
  router.get('/twitter', passport.authenticate('twitter', { scope: 'email' }));

  // Handle the callback after twitter has authenticated the user
  router.get('/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // Unlink twitter
  router.get('/unlink/twitter', function (req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  // The auth routes have been configured. Return them now.
  return router;
};