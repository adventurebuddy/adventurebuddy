
// Load all of the modules we need ============================================
var LocalStrategy = require('passport-local').Strategy;  //Local auth
var FacebookStrategy = require('passport-facebook').Strategy; //Facebook auth
var User = require('../models/user'); //User model
var configAuth = require('./accounts'); //Facebook and google account configuration
const util = require('util');//util.inspect

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
	passport.use('facebook',new FacebookStrategy(

    // pull in our app id and secret from our auth.js file
	{
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
		passReqToCallback : false,
        profileFields: ['id', 'emails', 'first_name', 'middle_name', 'last_name','gender','picture','birthday','locale']
    },
	
	// facebook will send back the token and profile
    function(token, refreshToken, profile, done) 
	{

        // asynchronous
        process.nextTick(function() 
		{
			console.log('Received FaceBook login request for profile: %s',util.inspect(profile, false, null) );
			console.log('Token is: %s',token );
		
            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) 
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
				else 
				{
					console.log('No existing user. Creating...');
					
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    

					//TODO: parse the facebook fields into our required fields.
					newUser.email = profile.emails[0].value;
					newUser.username = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.created = new Date();
					
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });
	
	}));
}
