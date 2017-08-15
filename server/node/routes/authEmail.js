// Load modules ===============================================================

//Database models
var db = require("../models");

//For inspect
const util = require('util');

//For making requests
var request = require('request');

//For hashing things
var hash = require('object-hash');

//Login info for our various accounts
var accounts = require('../config/accounts');

//Date utilities
var dateUtil = require('../util/dateUtil');

//For sending emails
var emailUtil = require('../util/emailUtil);

//Sign up a new user ======================================================
module.exports.signupRequest = function(req, res, next)
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
	if (req.body.password.length < 8)
	{
		console.log('ERROR: Password %s is invalid.', req.body.password);
		valid = false;
	}
	if (req.body.agree !== true)
	{
		console.log('ERROR: User did not accept our ToS.', req.body.agree);
		valid = false;
	}
	if (!valid)
	{
		console.log('ERROR: User signup request failed form validation.  So the signup form is broken or someone is sending us bogus requests from a script somewhere.');
		res.status(400).send(
		{
			error: 'Form input validation error.',
			errorcode: 0
		});
		return;
	}
	console.log('Signup form validated ok.');

	//Create the new user object ------------------------------------------

	//Generate a (probably) unique email verification string
	var verificationString = hash(req.body);

	//Create a new user object.
	var newUser = new db.User();
	newUser.password = newUser.generateHash(req.body.password);
	newUser.email = req.body.email.toLowerCase();
	newUser.emailConfirmed = false;
	newUser.verifyString = verificationString;

	//Check the user's birthdate ------------------------------------------

	//To comply with COPPA, you CANNOT tell the user they were rejected because of their age.
	//If under 13, return success but do NOT save the data and do NOT send a confirmation email.
	//This is a bad law but we have to follow it. $16,000 - $40,654 fine per violation. - ADH

	//Determine the user's age
	var dob = new Date(parseInt(req.body.dobYear), dateUtil.getMonthFromString(req.body.dobMonth) - 1, parseInt(req.body.dobDay));
	var today = new Date(Date.now());
	newUser.birthdate = dob;
	newUser.created = today;
	var years = today.getFullYear() - dob.getFullYear();
	if (dob.getMonth() > today.getMonth() || (dob.getMonth() === today.getMonth() && dob.getDate() > today.getDate()))
	{
		years--;
	}

	//You know what, out of an abundance of caution, I've decided all users have to be 14.  That 
	//should be a bulletproof legal defense and it saves me having to write code for leap years 
	//and time zones. - ADH
	if (years < 14)
	{
		console.log('ERROR: It\'s a kid!  ABORT! ABORT! age = %d today=%d/%d/%d dob = %d/%d/%d\n', years, today.getFullYear(), today.getMonth() + 1, today.getDate(), dob.getFullYear(), dob.getMonth() + 1, dob.getDate());
		res.status(200).send(
		{
			email: newUser.email,
			emailConfirmed: false
		});
		return;
	}
	console.log('User is over 14.  age = %d today=%d/%d/%d dob = %d/%d/%d', years, today.getFullYear(), today.getMonth() + 1, today.getDate(), dob.getFullYear(), dob.getMonth() + 1, dob.getDate());

	//Upsert them into the database -----------------------------------------

	//This will insert them if no existing user has the same email.  
	//If an existing user is found it will return the existing user.
	db.User.findOneAndUpdate({'email': req.body.email},
	{
		$setOnInsert: newUser
	},
	{
		upsert: true
	}, function(err, doc)
	{
		//Handle errors
		if (err)
		{
			console.log('ERROR: Upsert error: %s', err);
			res.status(400).send(
			{
				error: 'Server error. Please try again later.',
				errorcode: 5
			});
			return;
		}
		if (doc !== null)
		{
			console.log('ERROR: Email is already registered:%s.\n', doc);
			res.status(400).send(
			{
				error: 'That email is already registered.',
				errorcode: 2
			});
			return;
		}

		//User was successfully inserted.
		console.log('Upserted user %s into database.', newUser.username);

		//Validate the captcha ------------------------------------------------

		//This may seem out of order since we have already put them into the database.
		//Once a recaptcha is submitted to google, the reCAPTCHA is no longer valid.
		//We do this last so that the user does not need to complete another reCAPTCHA
		//if they pick a username or email that is already registered.

		//Our secret key from google
		var secretKey = accounts.recaptcha.key;

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

				//Delete the user from the database.
				newUser.remove();

				return;
			}
			console.log('User passed reCAPTCHA validation.  VERY GOOD HE IS A HUMAN JUST LIKE US.  WE SHOULD CHAT ABOUT OUR EMOTIONS AND INTERNAL SKELETONS');

			//Send them a confirmation email with a unique link in it ------------------------------------------
			var verifyUrl = 'http://127.0.0.1/node/verify?id=' + verificationString;
			var mailOptions = {
				from: 'Adventure Buddy <accounts@adventure-buddy.com>',
				to: newUser.email,
				subject: 'Adventure awaits!  Please verify your account.',
				text: 'To verify your account, please click the following URL:\n\n' + verifyUrl + '\n\nPlease do not respond to this email.  It was generated from an unmonitored inbox.\n\nFor questions or support, contact support@adventure-buddy.com.'
			};
			emailUtil.sendMail(mailOptions, function(error, info)
			{
				if (error)
				{
					console.log('ERROR: can\'t send verification email: ' + error);
					res.status(500).send(
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
					res.status(200).send(
					{
						email: newUser.email,
						emailConfirmed: false
					});
				}
			});
		});
	});		
}

//Verify a new user's email ======================================================
module.exports.verifyEmailRequest = function(req, res)
{
	//Log the request -----------------------------------------------------
	console.log("Verify request: %s", util.inspect(req.body, false, null));

	//Mark the user's email as verified if it exists ----------------------
	var id = req.param('id')
	console.log('Checking DB for user with verify id %s', id);
	db.User.findOneAndUpdate(
	{
		'verifyString': id
	},
	{
		$set:
		{
			emailConfirmed: true
		}
	},
	{
		new: true
	}, function(err, doc)
	{
		//Handle errors
		if (err || doc === null)
		{
			console.log('ERROR: Update error: %s', err);
			res.status(400).send(
			{
				error: 'Server error. Please try again later.',
				errorcode: 5
			});
			return;
		}

		//Found 'em!  Redirect them to the confirm page
		console.log('Verified email of user: %s ', doc);
		res.redirect('/confirm')

	});
}

//Log in a user ====================================================================
module.exports.logInRequest = function(req, res, next)
{
	//Log the request
	console.log("Login request: %s", util.inspect(req.body, false, null));
	
	//Authenticate with passport-local
	passport.authenticate('email', function(err, user, info)
	{

		//If there was an error, send an error message
		if (err || (!user))
		{
			console.log('Login error, your username or password is incorrect: %s',err);
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
				return;
			}
			console.log('Successfully logged in user %s.\n', user.username);
			return res.status(200).send(user);
		});

	})(req, res, next);
}

//Send a password reset email ======================================================
module.exports.forgotPasswordRequest = function(req, res)
{
}

//Reset a user's password ======================================================
module.exports.passwordResetRequest = function(req, res)
{
	//Log the request -----------------------------------------------------
	console.log("Password reset request: %s", util.inspect(req.body, false, null));

	//Find a user with this resetString if they exist -------------------------------------
	console.log('Checking DB for user with resetString %s', req.body.resetString);
	db.User.findOne(
	{
		'resetString': req.body.resetString
	}, function(err, user)
	{
		//Handle errors
		if (err || user === null)
		{
			console.log('ERROR: Update error: %s', err);
			res.status(500).send(
			{
				error: 'Error querying for user with resetString ' + req.body.resetString + ': ' + err,
				errorcode: 2
			});
			return;
		}

		//Verify it has been less than one hour since the email was sent.--------------
		var resetTimeElapsed = Date.now() - user.reset.getTime();
		if (resetTimeElapsed > 60 * 60 * 1000)
		{
			console.log('ERROR: reset link has expired after %d seconds.', resetTimeElapsed);
			res.status(500).send(
			{
				error: 'That link has expired.',
				errorcode: 1
			});
			return;
		}


		//Found 'em!  Change their password to the new one ----------------------------
		console.log('Found user: %s', user);
		user.reset = undefined;
		user.resetString = undefined;
		user.password = user.generateHash(req.body.password);
		user.save(function(err, updatedUser)
		{
			//Handle errors
			if (err)
			{
				console.log('ERROR: Update error: %s', err);
				res.status(500).send(
				{
					error: 'Error updating user\'s password: ' + err,
					errorcode: 3
				});
				return;
			}
			//We're done.  Return the user JSON as success. -------------------------------------------
			console.log('Password reset successful.\n');
			res.status(200).send();
		});
	});
};	