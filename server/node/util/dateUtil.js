// This turns a month name into an integer ====================================
module.exports.getMonthFromString = function(mon)
{

    var d = Date.parse(mon + "1, 2012");
    if (!isNaN(d))
    {
        return new Date(d).getMonth() + 1;
    }
    return -1;
}