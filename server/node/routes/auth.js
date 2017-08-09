// Load modules ===============================================================

var db = require("../models");
const util = require('util');
var request = require('request');

// Routes for passport.js authentication ======================================

module.exports = function(app, passport)
{
    //Process the login form -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //Set an additional callback to authenticate with passport.js
    app.post("/node/login", passport.authenticate('local-login'), function(req, res)
    {
        //Log the request
        console.log("Login request: %s\n", util.inspect(req.body, false, null));

        //Send the user JSON as a response
        res.json(req.user);
    });

    //Process logouts -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    app.delete("/node/login", function(req, res)
        {
            //Log the request
            console.log("Logout request: %s\n", util.inspect(req.body, false, null));

            //Log the user out
            req.logOut();

            //Send 200 OK as a response
            res.sendStatus(200);
        })

    //Figure out if a user is authenticated -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    app.get("/node/login", function(req, res)
        {
            //Log the request
            console.log("IsLoggedIn request: %s\n", util.inspect(req.body, false, null));

            //Send the user JSOn as a response or 0 if not logged in
            res.send(req.isAuthenticated() ? req.user : '0');
        });

    //Sign up a new user -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post("/node/user", function(req, res)
    {
        //Log the request -----------------------------------------------------
        console.log("Signup request: %s", util.inspect(req.body, false, null));

		//Validate the form inputs --------------------------------------------
		var valid = true;
        var looksLikeAnEmail = new RegExp('.+@.+\\..+');
        if (!looksLikeAnEmail.test(req.body.email))
        {
            console.log('ERROR: User\'s email address %s is invalid.',req.body.email);
			valid = false;
        }
		if(req.body.agree!==true)
		{
            console.log('ERROR: User did not accept our ToS.',req.body.agree);	
			valid = false;
		}
		if(req.body.username.length<6)
		{
            console.log('ERROR: Username %s is invalid.',req.body.username);	
			valid = false;
		}
		if(req.body.password.length<8)
		{
            console.log('ERROR: Password %s is invalid.',req.body.password);	
			valid = false;
		}
		if(!valid)
		{
			console.log('ERROR: User signup request failed form validation.  This means the signup form is FUBARed or someone is sending us bogus requests from a script somewhere.');
			res.status(400).send({error:'Form input validation error.',errorcode:0});
			return;		
		}
		console.log('Signup form validated ok.');

		//Check the user's birthdate ------------------------------------------
		
		//To comply with COPPA, you CANNOT tell the user they were rejected because of their age.
		//If under 13, return success but do NOT save the data and do NOT send a confirmation email.
		//Shitty retarded law but we have to follow it. $16,000 - $40,654 fine per violation. - ADH
		//TODO
		
        //Make sure the username or email isn't taken -------------------------
		
		//Callback hell!  MY EYES!  THEY FUCKING BURN!
		
		//Check to see if a user with this name exists in the DB
        db.User.findOne({username: req.body.username.toLowerCase()},
			function(err, user)
			{
				if (user)
				{
					console.log('ERROR: Username %s is already registered.\n',req.body.username.toLowerCase());
					res.status(400).send({error:'That username is already registered.',errorcode:1});
					return;		
				}
				console.log('Username %s is available.',req.body.username.toLowerCase());
				
				//Check to see if a user with this email exists in the DB
				db.User.findOne({email: req.body.email.toLowerCase()},
					function(err, user)
					{
						if (user)
						{
							console.log('ERROR: Email %s is already registered.\n',req.body.email.toLowerCase());
							res.status(400).send({error:'That email is already registered.',errorcode:2});
							return;		
						}
						console.log('Email %s is available.',req.body.email.toLowerCase());
		
						//Validate the captcha ------------------------------------------------
						
						//Our secret key from google
						var secretKey = '6LerFCwUAAAAAF3k5gzFJG1c6U0ZAcVQOnp3OHx2';
						
						//Verification URL
						var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.recaptchaResponse + "&remoteip=" + req.connection.remoteAddress;
						
						//GET the verification URL. Google will respond with success or error message.
						request(verificationUrl,function(error,response,body) 
						{
							body = JSON.parse(body);
							if(body.success !== undefined && !body.success)
							{
								//CAPTCHA failed, return error
								console.log('ERROR: User failed reCAPTCHA validation. THE GOOGLE HUMANS SAY THIS USER IS A ROBOT UNLIKE US SQUISHY HUMANS WHO ARE TOTALLY NOT ROBOTS beep boop\n');
								res.status(400).send({error:'Google says you are a robot.',errorcode:3});
								return;		
							}
							console.log('User passed reCAPTCHA validation. VERY GOOD HE IS A HUMAN JUST LIKE US.  WE SHOULD CHAT ABOUT OUR EMOTIONS AND INTERNAL SKELETONS');

							//OK, this signup request is good -------------------------------------
							
							//Send them a confirmation email with a unique link in it
							//TODO

							//Create a new user object.
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
								console.log('Added user %s to database.',newUser.username);
								//Log them in
								req.login(user, function(err)
								{
									if (err)
									{
										return next(err);
									}
									console.log('Logged user in.  Signup complete.\n');

									//Return the user JSON as the response
									res.json(user);
								});
							});
						});
					});
			});
    });
};
