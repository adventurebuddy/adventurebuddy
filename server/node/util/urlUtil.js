// Load modules ===============================================================

//For getting the hostname
var os = require('os');

//Function for getting the right hostname to use ==============================
module.exports.getServerHostname = function()
{
	if(os.hostname()!=='www.adventure-buddy.com')
	{
		return 'local.adventure-buddy.com';
	}
	return 'www.adventure-buddy.com';
}
