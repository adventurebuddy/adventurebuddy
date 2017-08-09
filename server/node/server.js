// Load modules ===============================================================

var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

// Configure passport.js =====================================================

require('./config/passport')(passport); // pass passport for configuration

// Our express app ===========================================================

var app = express();

//Set up cookie and session options
app.use(session(
{
    secret: 'SETEC ASTRONOMY',
    resave: false,
    saveUninitialized: false,
    cookie:
    {
        secure: false
    } //TODO: should set this to true when running on server!
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Set up body-parser options
app.use(bodyParser.json()); //for parsing application/json
app.use(bodyParser.urlencoded(
{
    extended: true
}));

//Set up routes
require('./routes/auth.js')(app, passport); // load our routes and pass in our app and fully configured passport

//Start listening
app.listen(3000, "0.0.0.0");
console.log('+-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=+\n');
console.log('|   ADVENTURE BUDDY SERVER APP   |\n');
console.log('+-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=+\n');
console.log('App started.  Listening on port 3000...\n');
