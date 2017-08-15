// Load modules ===============================================================

//For email
var nodemailer = require('nodemailer');

//Login info for our various accounts
var accounts = require('../config/accounts');

// Transporter for various emails =============================================
var transporter = nodemailer.createTransport(
{
    service: 'gmail',
    auth:
    {
        user: accounts.gmail.email,
        pass: accounts.gmail.password
    }
});

// Function to send mail ======================================================
module.exports.sendMail = function(options,callback)
{
	transporter.sendMail(options,callback);
}
