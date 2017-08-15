/*
 * Routes in this file:
 * POST   /node/login  - log in a user
 * GET    /node/login  - check if a user is logged in
 * DELETE /node/login  - log out a user
 * POST   /node/user   - sign up a new user
 * GET    /node/verify - verify a new user's email. NOTE: not RESTful, should be a PUT
 * PUT    /node/forgot - send a password reset email with a secret key
 * PUT    /node/reset  - reset a user's password using the key from the email
 */

// Load modules ===============================================================

//Handlers for email authentication strategy
var authEmail = require('./authEmail');

//For inspect
const util = require('util');

// Routes for the Adventure Buddy app =========================================

module.exports = function(app, passport)
{
	
	//General authentication routes -------------------------------------------

    //Figure out if a user is authenticated
    app.get("/node/login", function(req, res)
    {
        //Log the request
        console.log("IsLoggedIn request: %s\n", util.inspect(req.body, false, null));

        //Send the user JSON as a response or 0 if not logged in
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    //Process logouts
    app.delete("/node/login", function(req, res)
    {
        //Log the request
        console.log("Logout request: %s\n", util.inspect(req.body, false, null));

        //Log the user out
        req.logOut();

        //Send 200 OK as a response
        res.sendStatus(200);
    });
	
	//Email authentication routes ---------------------------------------------
	
    //Sign up a new user
    app.post("/node/user", authEmail.signupRequest);

    //Verify a new user's email
    app.get("/node/verify", authEmail.verifyEmailRequest);

    //Send a password reset email
    app.put("/node/forgot", authEmail.forgotPasswordRequest);

    //Reset a user's password
    app.put("/node/reset", authEmail.passwordResetRequest);
	
    //Process the login form
    app.post("/node/login", authEmail.logInRequest);
	
	//Facebook authentication routes ------------------------------------------
		
	//Log in a new user using facebook
    app.get('/node/login/facebook',
        passport.authenticate('facebook', 
		{ 
			//Things we want to know from facebook
			scope : ['email','user_birthday','public_profile']
		}));
		
    //Handle the facebook authentication callback
    app.get('/node/login/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
		
	//Google authentication routes ------------------------------------------
		
	//Log in a new user using google
	app.get('/node/login/google', 
		passport.authenticate('google', 
		{ 
			scope : [
				'https://www.googleapis.com/auth/user.emails.read',
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email'] 
		}));

    //Handle the Google authentication callback
    app.get('/node/login/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
		
};
