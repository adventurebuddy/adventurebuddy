var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/passport-db",
{
    useMongoClient: true
});
mongoose.set("debug", true);
module.exports.User = require("./user");
