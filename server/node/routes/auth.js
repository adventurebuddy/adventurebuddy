// Load modules ===============================================================

var db = require("../models");
const util = require('util');

// Routes for passport.js authentication ======================================

module.exports = function(app, passport)
{
    //Process the login form --------------------------------------------------
	//Set an additional callback to authenticate with passport.js
    app.post("/node/login", passport.authenticate('local-login'), function(req, res)
    {
		//Log the request
        console.log("Login request: %s\n", util.inspect(req.body, false, null));
		
		//Send the user JSON as a response
        res.json(req.user);
    });

    //Process logouts ---------------------------------------------------------
    app.post("/node/logout", function(req, res)
    {
		//Log the request
        console.log("Logout request: %s\n", util.inspect(req.body, false, null));
		
		//Log the user out
        req.logOut();
		
		//Send 200 OK as a response
        res.sendStatus(200);
    })

    //Figure out if a user is authenticated -----------------------------------
    app.get("/node/loggedin", function(req, res)
    {
		//Log the request
        console.log("IsLoggedIn request: %s\n", util.inspect(req.body, false, null));
		
		//Send the user JSOn as a response or 0 if not logged in
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    //Sign up a new user ------------------------------------------------------
    app.post("/node/signup", function(req, res)
    {
		//Log the request
        console.log("Signup request: %s\n", util.inspect(req.body, false, null));
		
		//Try to find a user with the requested name
        db.User.findOne(
        {
            username: req.body.username
        }, 
		
		//Process the results
		function(err, user)
        {
			//If the user exists, 
            if (user)
            {
				//return null to indicate they need to pick a different name.
                res.json(null);
                return;
            }
			//Otherwise,
            else
            {
				//TODO: check the user's birthdate.  If under 13, throw this data out.
				
				//TODO: Otherwise, send a confirmation email
				
				//Create a new user object
                var newUser = new db.User();
                newUser.username = req.body.username.toLowerCase();
                newUser.password = newUser.generateHash(req.body.password);
				newUser.agree = req.body.agree;
				newUser.email = req.body.email.toLowerCase();
				newUser.emailConfirmed = false;
				
				//TODO: Save email confirmation string
				
				//TODO: Save user's birthdate
				
				//Add them to the database
                newUser.save(function(err, user)
                {
					//Log them in
                    req.login(user, function(err)
                    {
                        if (err)
                        {
                            return next(err);
                        }
						
						//Return the user JSON as the response
                        res.json(user);
                    });
                });
            }
        });
    });
};
