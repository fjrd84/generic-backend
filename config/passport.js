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
    environment = require('./environment'),
    passportCallbacks = require('./passport-callbacks');

// User model
let User = require('../app/models/user');

/**
 * A function will be returned, that takes passport as a parameter.
 * When invoked, this function sets up the passport configuration.
 * @param {any} passport module
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
    }, passportCallbacks.localLogin));

    /**
     * Signup
     */
    passport.use('local-signup', new LocalStrategy({
        // Override the username by email as the login field.
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, passportCallbacks.localSignup));

    let tokenExtractor = (req) => {
        return req.query.token || ExtractJwt.fromAuthHeader()(req);
    };

    /***********************************************************************
     * JWT TOKEN STRATEGY 
     ***********************************************************************/
    passport.use(new JwtStrategy({
        secretOrKey: environment.secretKey,
        jwtFromRequest: tokenExtractor
    }, passportCallbacks.tokenCb));

    /***********************************************************************
     * FACEBOOK STRATEGY
     ***********************************************************************/
    passport.use(new FacebookStrategy({
        clientID: environment.auth.facebookAuth.clientID,
        clientSecret: environment.auth.facebookAuth.clientSecret,
        callbackURL: environment.auth.facebookAuth.callbackURL,
        passReqToCallback: true
    }, passportCallbacks.facebook));


    /***********************************************************************
     * TWITTER STRATEGY
     ***********************************************************************/
    passport.use(new TwitterStrategy({
        consumerKey: environment.auth.twitterAuth.consumerKey,
        consumerSecret: environment.auth.twitterAuth.consumerSecret,
        callbackURL: environment.auth.twitterAuth.callbackURL,
        passReqToCallback: true
    }, passportCallbacks.twitter));

    /***********************************************************************
     * GOOGLE STRATEGY
     ***********************************************************************/
    passport.use(new GoogleStrategy({
        clientID: environment.auth.googleAuth.clientID,
        clientSecret: environment.auth.googleAuth.clientSecret,
        callbackURL: environment.auth.googleAuth.callbackURL,
        passReqToCallback: true
    }, passportCallbacks.google));

};
