// Load modules ===============================================================
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define user model schema ===================================================
var userSchema = mongoose.Schema(
{
    username: {type:String,required:true,unique:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true,unique:false},
    agree: {type:Boolean,required:true,unique:false},
    verifyString: {type:String,required:true,unique:false},
    emailConfirmed: {type:Boolean,required:true,unique:false},
    birthdate: {type:Date,required:true,unique:false},
	created: {type:Date,required:true,unique:false}
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
