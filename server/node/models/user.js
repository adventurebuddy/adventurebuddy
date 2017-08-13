// Load modules ===============================================================
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define user model schema ===================================================
var userSchema = mongoose.Schema(
{
    //The user's username.  Must be unique.  Together with email constitutes the User DB primary key.
    username:
    {
        type: String,
        required: true,
        unique: true
    },

    //The user's email.  Must be unique.  Together with username constitutes the User DB primary key.
    email:
    {
        type: String,
        required: true,
        unique: true
    },

    //The hash of the user's password.
    password:
    {
        type: String,
        required: true,
        unique: false
    },

    //Whether the user agreed to the terms.  Should always be true.  We keep this for legal reasons.
    agree:
    {
        type: Boolean,
        required: true,
        unique: false
    },

    //Email verification string.  Sent in the account verification email.
    verifyString:
    {
        type: String,
        required: true,
        unique: false
    },

    //Whether or not the email is confirmed.  Defaults to false and is set true when the user verifies their email.
    emailConfirmed:
    {
        type: Boolean,
        required: true,
        unique: false
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

    //Given Name
    //TODO

    //Surname
    //TODO

    //Middle Name
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
