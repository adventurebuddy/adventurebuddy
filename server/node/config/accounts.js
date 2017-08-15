// config/accounts.js

// expose our config directly to our application using module.exports
module.exports = {

	//IDs and keys for facebook authentication & authorization
    'facebookAuth' : 
	{
        'clientID'      : '162190351009464', // your App ID
        'clientSecret'  : 'a6b34a96d212db348d598db2065f1fed', // your App Secret
        'callbackURL'   : 'http://local.adventure-buddy.com/node/login/facebook/callback'
    },

	//IDs and keys for Google authentication and authorization
    'googleAuth' : 
	{
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://local.adventure-buddy.com/login/google/callback'
    },
	
	//Password for maintenance account to use with nodemailer
	'gmailAuth' :
	{
		'service'		: 'gmail',
		'email'			: 'accounts@adventure-buddy.com',
		'password'		: 'supersecretaccountsemailpassword'
	},
	
	//IDs and keys for Google reCAPTCHA service
	'reCaptchaAuth' :
	{
		'key'			: '6LerFCwUAAAAAF3k5gzFJG1c6U0ZAcVQOnp3OHx2'
	}

};