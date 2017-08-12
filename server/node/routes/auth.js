// Load modules ===============================================================

var db = require("../models");
const util = require('util');
var request = require('request');
var nodemailer = require('nodemailer');
var hash = require('object-hash');

// This turns a month name into an integer ====================================
function getMonthFromString(mon)
{

    var d = Date.parse(mon + "1, 2012");
    if (!isNaN(d))
    {
        return new Date(d).getMonth() + 1;
    }
    return -1;
}

// Transporter for various emails =============================================
var transporter = nodemailer.createTransport(
{
    service: 'gmail',
    auth:
    {
        user: 'accounts@adventure-buddy.com',
        pass: 'fuckyouyoufuckingfuck'
    }
});

// Routes for passport.js authentication ======================================

module.exports = function(app, passport)
{
    //Process the login form -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //Set an additional callback to authenticate with passport.js
    app.post("/node/login",  function(req, res, next) 
	{
		passport.authenticate('local-login', function(err, user, info) 
		{
			//Log the request
			console.log("Login request: %s", util.inspect(req.body, false, null));
		
			//If there was an error, send an error message
			if (err ||(!user)) 
			{ 
				console.log('Login error, your username or password is bullshit.');
				res.status(400).send(
				{
					error: 'Invalid username or password.',
					errorcode: 1
				});
				return;
			}
			
			//If this user's email has not yet been validated, send a different error message
			if (!user.emailConfirmed) 
			{ 
				console.log('Login error, your email is unverified.\n');
				res.status(400).send(
				{
					error: 'You must verify your account by clicking the link in your email.',
					errorcode: 2
				});
				return;
			}
			
			//Return success.
			req.logIn(user, function(err) 
			{
				if (err) 
				{ 
					console.log('Login error, weird server problem.\n');
					res.status(400).send(
					{
						error: 'Server error.  Please try again later.',
						errorcode: 3
					});
				}
				console.log('Successfully logged in user %s.\n',user.username);
				return res.status(200).send(user);
			});
			
		})(req, res, next);
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
            console.log('ERROR: User\'s email address %s is invalid.', req.body.email);
            valid = false;
        }
        if (req.body.agree !== true)
        {
            console.log('ERROR: User did not accept our ToS.', req.body.agree);
            valid = false;
        }
        if (req.body.username.length < 6)
        {
            console.log('ERROR: Username %s is invalid.', req.body.username);
            valid = false;
        }
        if (req.body.password.length < 8)
        {
            console.log('ERROR: Password %s is invalid.', req.body.password);
            valid = false;
        }
        if (!valid)
        {
            console.log('ERROR: User signup request failed form validation.  This means the signup form is FUBARed or someone is sending us bogus requests from a script somewhere.');
            res.status(400).send(
            {
                error: 'Form input validation error.',
                errorcode: 0
            });
            return;
        }
        console.log('Signup form validated ok.');

        //Check the user's birthdate ------------------------------------------

        //To comply with COPPA, you CANNOT tell the user they were rejected because of their age.
        //If under 13, return success but do NOT save the data and do NOT send a confirmation email.
        //Shitty retarded law but we have to follow it. $16,000 - $40,654 fine per violation. - ADH
		
        var dob = new Date(parseInt(req.body.dobYear), getMonthFromString(req.body.dobMonth) - 1, parseInt(req.body.dobDay));
        var today = new Date(Date.now());
        var years = today.getFullYear() - dob.getFullYear();
        if (dob.getMonth() > today.getMonth() || (dob.getMonth() === today.getMonth() && dob.getDate() > today.getDate()))
        {
            years--;
        }
        //You know what, fuck it.  Just so we don't get fucked by leap years or some shit, they have to be 14.  God I wish I was starting a business in China. - ADH
        if (years < 14)
        {
            console.log('ERROR: It\'s a kid!  ABORT! ABORT!  But act like we aren\'t aborting because some very wise politicians \\s said not to.  age = %d today=%d/%d/%d dob = %d/%d/%d\n', years, today.getFullYear(), today.getMonth()+1, today.getDate(), dob.getFullYear(), dob.getMonth()+1, dob.getDate());
            res.json(req.body);
            return;
        }
        console.log('User is over 14, no need to shit pants.  age = %d today=%d/%d/%d dob = %d/%d/%d', years, today.getFullYear(), today.getMonth()+1, today.getDate(), dob.getFullYear(), dob.getMonth()+1, dob.getDate());

		//Validate the captcha ------------------------------------------------

		//Our secret key from google
		var secretKey = '6LerFCwUAAAAAF3k5gzFJG1c6U0ZAcVQOnp3OHx2';

		//Verification URL
		var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.recaptchaResponse + "&remoteip=" + req.connection.remoteAddress;

		//GET the verification URL. Google will respond with success or error message.
		request(verificationUrl, function(error, response, body)
		{
			body = JSON.parse(body);
			if (body.success !== undefined && !body.success)
			{
				//CAPTCHA failed, return error
				console.log('ERROR: User failed reCAPTCHA validation. THE GOOGLE HUMANS SAY THIS USER IS A ROBOT UNLIKE US SQUISHY HUMANS WHO ARE TOTALLY NOT ROBOTS beep boop\n');
				res.status(400).send(
				{
					error: 'Google says you are a robot.',
					errorcode: 3
				});
				return;
			}
			console.log('User passed reCAPTCHA validation. VERY GOOD HE IS A HUMAN JUST LIKE US.  WE SHOULD CHAT ABOUT OUR EMOTIONS AND INTERNAL SKELETONS');
			
			//Create the new user object ------------------------------------------

			//Generate a (probably) unique email verification string
			var verificationString = hash(req.body);
			
			//Create a new user object.
			var newUser = new db.User();
			newUser.username = req.body.username.toLowerCase();
			newUser.password = newUser.generateHash(req.body.password);
			newUser.agree = req.body.agree;
			newUser.email = req.body.email.toLowerCase();
			newUser.emailConfirmed = false;
			newUser.verifyString = verificationString;
			newUser.dob = dob;
			newUser.created = today;

			//Upsert them into the database -----------------------------------------
			
			//This will insert them if no existing user has the same username or email.  
			//If an existing user is found it will return the existing user.
			var query = {$or:[{'username':req.body.username},{'email':req.body.email}]};
			db.User.findOneAndUpdate(query,{$setOnInsert: newUser},{upsert:true}, function(err, doc)
			{
				//Handle errors
				if (err)
				{
					console.log('ERROR: Upsert error: %s',err);
					res.status(400).send(
					{
						error: 'Server error. Please try again later.',
						errorcode: 5
					});
					return;
				}
				if(doc!==null)
				{
					if(doc.email===newUser.email)
					{
						console.log('ERROR: Email is already registered:%s.\n', doc);
						res.status(400).send(
						{
							error: 'That email is already registered.',
							errorcode: 2
						});
					}
					else
					{
						console.log('ERROR: Username is already registered:%s.\n', doc);
						res.status(400).send(
						{
							error: 'That username is already registered.',
							errorcode: 1
						});
					}
					return;
				}
				
				//User was successfully inserted.
				console.log('Upserted user %s into database.', newUser.username);

				//Send them a confirmation email with a unique link in it ------------------------------------------
				var verifyUrl = 'http://127.0.0.1/node/verify?id='+verificationString;
				var mailOptions = {
					from: 'Adventure Buddy <accounts@adventure-buddy.com>',
					to: newUser.email,
					subject: 'Adventure awaits!  Please verify your account.',
					text: 'To verify your account, please click the following URL:\n\n'+verifyUrl+'\n\nPlease do not respond to this email.  It was generated from an unmonitored inbox.\n\nFor questions or support, contact support@adventure-buddy.com.'
				};
				transporter.sendMail(mailOptions, function(error, info)
				{
					if (error)
					{
						console.log('ERROR: can\'t send verification email: '+error);
						res.status(400).send(
						{
							error: 'Cannot send verification email.',
							errorcode: 4
						});
						return;
					}
					else
					{
						//We're done.  Return the user JSON as success. -------------------------------------------
						console.log('Sent verification email: ' + info.response);
						console.log('Signup complete.\n');
						res.json(newUser);
					}
				});
			});
		});
    });
	
	//Verify a new user's email =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	//NOTE:  This is not RESTful. It should be a PUT.  But URL links are designed to be idempotent (i.e. GET), 
	//so no way around it without annying HTML email messages with special link tags and I am too lazy. - ADH
    app.get("/node/verify", function(req, res)
	{
        //Log the request -----------------------------------------------------
        console.log("Verify request: %s", util.inspect(req.body, false, null));
		
        //Mark the user's email as verified if it exists ----------------------
        var id = req.param('id')
        console.log('Checking DB for user with verify id %s',id);
		db.User.findOneAndUpdate({'verifyString':id},{$set:{emailConfirmed:true}}, {new: true}, function(err, doc)
		{
			//Handle errors
			if (err)
			{
				console.log('ERROR: Update error: %s',err);
				res.status(400).send(
				{
					error: 'Server error. Please try again later.',
					errorcode: 5
				});
				return;
			}
			
			//Found 'em!
			console.log('Verified email of user: %s ',doc);
		
			//Redirect them to the confirmed page
			res.redirect('/confirmed')
			
		});
	});
};
