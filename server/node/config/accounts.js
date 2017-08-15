// A list of all the accounts and secret keys our app uses ====================

module.exports = {

	//IDs and keys for facebook authentication & authorization
    'facebook' : 
	{
        'clientID'      : '162190351009464',
        'clientSecret'  : 'a6b34a96d212db348d598db2065f1fed',
    },

	//IDs and keys for Google authentication and authorization
    'google' : 
	{
        'clientID'      : '210755115761-fvhko54ufnvvcsv1ccclse960efcbvu9.apps.googleusercontent.com',
        'clientSecret'  : 'V0scu9525BMZPGbLf7WGvUDa'
    },
	
	//Password for maintenance account to use with nodemailer
	'gmail' :
	{
		'email'			: 'accounts@adventure-buddy.com',
		'password'		: 'supersecretaccountsemailpassword'
	},
	
	//IDs and keys for Google reCAPTCHA service
	'recaptcha' :
	{
		'key'			: '6LerFCwUAAAAAF3k5gzFJG1c6U0ZAcVQOnp3OHx2'
	}

};