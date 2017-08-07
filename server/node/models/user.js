// Load modules ===============================================================
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define user model schema ===================================================
var userSchema = mongoose.Schema(
{
    username: String,
    password: String,
    email: String,
    agree: Boolean,
    emailConfirmed: Boolean,
    birthdate: Date
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
