// User model
let User = require('../app/models/user');

module.exports = {
  localLogin: (req, email, password, done) => {
    // Let the machine do its stuff and continue when the stack is free again. 
    process.nextTick(function () {
      User.findOne({ 'local.email': email }, function (err, user) {
        if (err)
          return done(err);
        // If no user is found, return the message
        if (!user)
          return done(null, false, 'No user has been found.');
        if (!user.validPassword(password))
          return done(null, false, 'Wrong password.');
        // If everything went fine, return the user 
        else
          return done(null, user);
      });
    });
  },
  localSignup: function (req, email, password, done) {
    // Async: let the machine do its stuff and continue when the stack is free again. 
    process.nextTick(function () {
      //  Whether we're signing up or connecting an account, we'll need
      //  to know if the email address is in use.
      User.findOne({ 'local.email': email }, function (err, existingUser) {
        if (err)
          return done(err);
        /*
         * Return an error when the email is already taken by another user.
         */
        if (existingUser)
          return done(null, false, 'There already exists an account with that email.');
        /*
         * When the user has already been logged in (using a different strategy),
         * the local login for this account will be set up now.
         */
        if (req.user) {
          let user = req.user;
          user.local.email = email;
          user.local.password = user.generateHash(password);
          user.save(function (err) {
            if (err)
              throw err;
            return done(null, user);
          });
          return;
        }
        //  We're not logged in, so we're creating a brand new user.
        let newUser = new User();
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);
        newUser.save(function (err) {
          if (err)
            throw err;
          return done(null, newUser);
        });
      });
    });
  },
  tokenCb: function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      done(null, user);
    });
  },
  facebook: function (req, token, refreshToken, profile, done) {

    // Async: let the machine do its stuff and continue when the stack is free again. 
    process.nextTick(function () {

      // check if the user is already logged in
      if (!req.user) {

        User.findOne({ 'facebook.id': profile.id },
          function (err, user) {
            if (err)
              return done(err);

            if (user) {

              // If there is a user id already but no token 
              // (user was linked at one point and then removed)
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                // The user will be updated and saved again.
                user.save(function (err) {
                  if (err)
                    throw err;
                });
              }

              return done(null, user); // user found, return that user
            } else {
              // If there is no user, create it now. 
              let newUser = new User();

              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.email = profile.emails[0].value;

              newUser.save(function (err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
              return;
            }
          });
        return;
      }
      /**
       * The user already exists and is logged in, we have to link accounts.
       */
      let user = req.user; // pull the user out of the session

      user.facebook.id = profile.id;
      user.facebook.token = token;
      user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
      user.facebook.email = profile.emails[0].value;

      user.save(function (err) {
        if (err)
          throw err;
        return done(null, user);
      });

    });
  },
  twitter: function (req, token, tokenSecret, profile, done) {

    // Asynchronous
    process.nextTick(function () {

      // Check if the user is already logged in
      if (!req.user) {

        User.findOne({ 'twitter.id': profile.id }, function (err, user) {
          if (err)
            return done(err);

          if (user) {
            /**
             * If there is a user id already but no token (user 
             * was linked at one point and then removed)
             */
            if (!user.twitter.token) {
              user.twitter.token = token;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;

              user.save(function (err) {
                if (err)
                  throw err;
                return;
              });
            }

            return done(null, user); // User found, return that user
          } else {
            // if there is no user, create them
            let newUser = new User();

            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            newUser.save(function (err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
        return;
      }
      // user already exists and is logged in, we have to link accounts
      let user = req.user; // pull the user out of the session

      user.twitter.id = profile.id;
      user.twitter.token = token;
      user.twitter.username = profile.username;
      user.twitter.displayName = profile.displayName;

      user.save(function (err) {
        if (err)
          throw err;
        return done(null, user);
      });

    });

  },
  google: function (req, token, refreshToken, profile, done) {

    // Asynchronous 
    process.nextTick(function () {

      // Check if the user is already logged in
      if (!req.user) {

        User.findOne({ 'google.id': profile.id }, function (err, user) {
          if (err)
            return done(err);

          if (user) {

            // If there is a user id already but no token (user was linked at one point and then removed)
            if (!user.google.token) {
              user.google.token = token;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value; // pull the first email

              user.save(function (err) {
                if (err)
                  throw err;
                return;
              });
            }

            return done(null, user); // Here is where the user must be returned.
          }
          let newUser = new User();

          newUser.google.id = profile.id;
          newUser.google.token = token;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value; // pull the first email

          newUser.save(function (err) {
            if (err)
              throw err;
            return done(null, newUser);
          });

        });
        return;
      }
      // user already exists and is logged in, we have to link accounts
      /*      User.findOne({ 'id': req.user.id }, function (err, user) {
              if (err)
                return done(err);*/

      let user = req.user;

      user.google = {};
      user.google.id = profile.id;
      user.google.token = token;
      user.google.name = profile.displayName;
      user.google.email = profile.emails[0].value; // pull the first email

      user.save(function (err) {
        if (err)
          throw err;
        return done(null, user);
      });
    });
    //});
  }
};