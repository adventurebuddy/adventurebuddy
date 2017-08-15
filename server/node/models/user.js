// Load modules ===============================================================
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define user model schema ===================================================
var userSchema = mongoose.Schema(
{
	//Basic info --------------------------------------------------------------
	
    //The user's email.  Must be unique.  Together with username constitutes the User DB primary key.
    email:
    {
        type: String,
        required: true,
        unique: true
    },

    //The user's birthdate.
    birthdate:
    {
        type: Date,
        required: true,
        unique: false
    },

    //The date the user's account was created.
    created:
    {
        type: Date,
        required: true,
        unique: false
    },

	//The user's sign-in method.  May be google, faceboook, or email.
	//TODO: add validation
	signInMethod:
    {
        type: String,
        required: true,
        unique: true
    },
	
	//Data for facebook login -------------------------------------------------
	
	//Facebook login data if authenticating with passport-facebook
    facebook: 
	{
        id: 
		{
			type: String,
			required: false,
			unique: true
		},
        token: 
		{
			type: String,
			required: false,
			unique: true
		}
    },
	
	//Data for email login -------------------------------------------------
	
    //The hash of the user's password if authenticating with email
    password:
    {
        type: String,
        required: false,
        unique: false
    },

    //Email verification string.  Sent in the account verification email.
    verifyString:
    {
        type: String,
        required: false,
        unique: false
    },

    //Whether or not the email is confirmed.  Defaults to false and is set true when the user verifies their email.
    emailConfirmed:
    {
        type: Boolean,
        required: true,
        unique: false
    },
	
    //The date the user reset their password.  If null, there are no pending password resets.
    reset:
    {
        type: Date,
        required: false,
        unique: false
    },

    //Password reset verification string.  Valid for one hour after the reset time.
    resetString:
    {
        type: String,
        required: false,
        unique: false
    }
	
	//Profile data ----------------------------------------------------
	
	//Sequential ID number
	//TODO

    //Given Name
    //TODO

    //Surname
    //TODO

    //Middle Name
    //TODO
	
	//Gender
	//TODO
	
    //Address
    //TODO

    //City
    //TODO

    //State/Province
    //TODO

    //Country
    //TODO

    //Postal code
    //TODO

    //Profile picture
    //TODO

    //Banner image
    //TODO

    //About me text
    //TODO

	//Currency
	//TODO

	//Locale
	//TODO
	
	//Site permissions -----------------------------------------------
	
    //List of trips this user can access
    //TODO

    //Etc.
    //TODO
});

// Define user model methods ==================================================

// Generate a hash ------------------------------------------------------------
userSchema.methods.generateHash = function(password)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check a password -----------------------------------------------------------
userSchema.methods.validPassword = function(password)
{
    return bcrypt.compareSync(password, this.password);
};

// Export the model for use in our app ======================================== 
module.exports = mongoose.model('User', userSchema);
