/**
 * 
 * config/passport.js
 * 
 * This files configures the passport module, following these 
 * strategies:
 * - local
 * - jwt
 * - oAuth
 *   - facebook
 *   - twitter
 *   - google
 * 
 */

// Import strategies
const LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    environment = require('./environment');

// User model
let User = require('../app/models/user');

/**
 * A function will be returned, that takes passport as a parameter.
 * When invoked, this function sets up the passport configuration.
 * @param {any} passport module
 */
/**
 * 
 * 
 * @param {any} passport
 */
module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    /***********************************************************************
     *  LOCAL STRATEGY 
     ***********************************************************************/
    /**
     * Login
     */
    passport.use('local-login', new LocalStrategy({
        /**
         * By default, local strategy uses username and password, we 
         * will override username with email
         **/
        usernameField: 'email',
        passwordField: 'password',
        /**
         * Allows us to pass in the req from our route (lets us check if a 
         * user is logged in or not)
         */
        passReqToCallback: true
    },
        function (req, email, password, done) {
            // Let the machine do its stuff and continue when the stack is free again. 
            process.nextTick(function () {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err)
                        return done(err);
                    // If no user is found, return the message
                    if (!user)
                        return done(null, false, 'No user has been found');
                    if (!user.validPassword(password))
                        return done(null, false, 'Wrong password.');
                    // If everything went fine, return the user 
                    else
                        return done(null, user);
                });
            });

        }));

    /**
     * Signup
     */
    passport.use('local-signup', new LocalStrategy({
        // Override the username by email as the login field.
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {

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
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {

                        let newUser = new User();

                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

    let tokenExtractor = (req) => {
        return req.query.token || ExtractJwt.fromAuthHeader()(req);
    };

    /***********************************************************************
     * JWT TOKEN STRATEGY 
     ***********************************************************************/
    passport.use(new JwtStrategy({
        secretOrKey: environment.secretKey,
        jwtFromRequest: tokenExtractor
    }, function (jwt_payload, done) {
        User.findOne({ _id: jwt_payload._id }, function (err, user) {
            if (err) {
                return done(err, false);
            }
            done(null, user);
        });
    }));

    /***********************************************************************
     * FACEBOOK STRATEGY
     ***********************************************************************/
    passport.use(new FacebookStrategy({
        clientID: environment.auth.facebookAuth.clientID,
        clientSecret: environment.auth.facebookAuth.clientSecret,
        callbackURL: environment.auth.facebookAuth.callbackURL,
        passReqToCallback: true
    },
        function (req, token, refreshToken, profile, done) {

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

                                    user.save(function (err) {
                                        if (err)
                                            throw err;
                                        return done(null, user);
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
                            }
                        });

                } else {
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

                }
            });

        }));


    /***********************************************************************
     * TWITTER STRATEGY
     ***********************************************************************/
    passport.use(new TwitterStrategy({
        consumerKey: environment.auth.twitterAuth.consumerKey,
        consumerSecret: environment.auth.twitterAuth.consumerSecret,
        callbackURL: environment.auth.twitterAuth.callbackURL,
        passReqToCallback: true
    },
        function (req, token, tokenSecret, profile, done) {

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
                                    return done(null, user);
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

                } else {
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
                }

            });

        }));

    /***********************************************************************
     * GOOGLE STRATEGY
     ***********************************************************************/
    passport.use(new GoogleStrategy({

        clientID: environment.auth.googleAuth.clientID,
        clientSecret: environment.auth.googleAuth.clientSecret,
        callbackURL: environment.auth.googleAuth.callbackURL,
        passReqToCallback: true

    },
        function (req, token, refreshToken, profile, done) {

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
                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
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
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    User.findOne({ 'id': req.user.id }, function (err, user) {
                        if (err)
                            return done(err);

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

                }

            });

        }));

};
