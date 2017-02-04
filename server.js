// server.js

/**
 * File to bootstrap the server. It took a scotch.io tutorial as a starting point.
 * https://scotch.io/tutorials/easy-node-authentication-setup-and-local
 */

// set up ======================================================================
var express = require('express');
var app = express();
var port = process.env.PORT || 3200;
var mongoose = require('mongoose');
var passport = require('passport');
var cors = require('cors');
var bluebird = require('bluebird');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var environment = require('./config/environment');

mongoose.Promise = bluebird;

app.use(cors());

// configuration ===============================================================
mongoose.connect(environment.db); // DB connection 

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(passport.initialize());

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server listening on port: ' + port);

module.exports = app;