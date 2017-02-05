// server.js

/**
 * File to bootstrap the server. It took a scotch.io tutorial as a starting point.
 * https://scotch.io/tutorials/easy-node-authentication-setup-and-local
 */

// set up ======================================================================
const environment = require('./config/environment'),
  express = require('express'),
  app = express(),
  port = environment.port,
  session = require('express-session'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  cors = require('cors'),
  bluebird = require('bluebird'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');


mongoose.Promise = bluebird;

app.use(cors());

// configuration ===============================================================
mongoose.connect(environment.db, function(err, res) {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log('Connected to Database: ' + environment.db);
  }
});

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(session({
  secret: environment.secretKey,
  resave: true,
  saveUninitialized: true
})); // persistent login sessions
app.use(passport.initialize());
app.use(passport.session());


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server listening on port: ' + port);

module.exports = app;