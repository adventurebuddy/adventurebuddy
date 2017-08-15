// Load all of the modules we need ============================================

//For Email authentication
var LocalStrategy = require('passport-local').Strategy;

//For facebook authentication
var FacebookStrategy = require('passport-facebook').Strategy;

//For Google authentication
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//For user model
var User = require('../models/user'); //User model

//For facebook and google account configuration
var accounts = require('./accounts');

//For inspect
const util = require('util');

// Expose these functions to our app using module.exports =====================
module.exports = function(passport)
{

	// Methods for local authentication method -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    passport.serializeUser(function(user, done)
    {
        done(null, user);
    });

    passport.deserializeUser(function(user, done)
    {
        done(null, user);
    });

    passport.use('email', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
        function(req, email, password, done)
        {
            User.findOne(
            {
                email: email.toLowerCase()
            }, function(err, user)
            {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false);

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false);
				
				//TODO: check if email verified

                // all is well, return successful user
                return done(null, user);
            });
        }
    ));
	
	// Methods for FaceBook authentication method -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	passport.use(new FacebookStrategy(

    // pull in our app id and secret from our auth.js file
	{
        clientID        : accounts.facebook.clientID,
        clientSecret    : accounts.facebook.clientSecret,
        callbackURL     : '/node/login/facebook/callback',
		passReqToCallback : true,
        profileFields: ['id', 'emails', 'first_name', 'middle_name', 'last_name','gender','picture','birthday','locale']
    },
	
	// facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) 
	{

        // asynchronous
        process.nextTick(function() 
		{
			console.log('Received FaceBook login request for profile: %s',util.inspect(profile, false, null) );
			console.log('Token is: %s',token );
		
            // find the user in the database based on their facebook id
            User.findOne({ 'authFacebook.id' : profile.id }, function(err, user) 
			{

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
				{
					console.log('ERROR: error finding user with facebook id %s: %s\n',profile.id,err);
                    return done(err);
				}

                // if the user is found, then log them in
                if (user) 
				{
					console.log('Found existing user. Logging in user:%s',user);
                    return done(null, user); // user found, return that user
                }
				
				//Otherwise, create the user.
				else 
				{
					console.log('No existing user. Creating...');
					
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.authFacebook.id    = profile.id; // set the users facebook id                   
                    newUser.authFacebook.token = token; // we will save the token that facebook provides to the user                    

					//Parse the facebook fields into our required fields.
					newUser.email = profile.emails[0].value;
					dob = profile._json.birthday.split('/');
					newUser.birthdate = new Date(dob[2],dob[0],dob[1]);
					newUser.created = new Date();
					
					//TODO: double-check user birthdate
					
					//Save all of the additional profile information we can get our hands on
					//TODO
					
                    // save our user to the database
                    newUser.save(function(err) 
					{
                        if (err)
						{
                            throw err;
						}

                        // if successful, return the new user
						console.log('Added user to database: %s\n',newUser);
                        return done(null, newUser);
                    });
                }

            });
        });
	
	}));
	
	// Methods for Google authentication method -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	passport.use(new GoogleStrategy(
	{
        clientID        : accounts.google.clientID,
        clientSecret    : accounts.google.clientSecret,
        callbackURL     : '/node/login/google/callback',
    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
			console.log('Received Google login request for profile: %s',util.inspect(profile, false, null) );
			console.log('Token is: %s',token );

            // try to find the user based on their google id
            User.findOne({ 'authGoogle.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.authGoogle.id    = profile.id;
                    newUser.authGoogle.token = token;
                    newUser.email = profile.emails[0].value;
					dob = '02/05/1986'.split('/');//TODO
					newUser.birthdate = new Date(dob[2],dob[0],dob[1]);
					newUser.created = new Date();
					
					//TODO: double-check user birthdate

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

}
