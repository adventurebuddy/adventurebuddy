var db = require("../models");

module.exports = function(app, passport)
{
    // process the login form
    app.post("/node/login", passport.authenticate('local-login'), function(req, res)
    {
        console.log("Login request: %s\n", JSON.stringify(req.user));
        res.json(req.user);
    });

    // handle logout
    app.post("/node/logout", function(req, res)
    {
        console.log("Logout request: %s\n", JSON.stringify(req.user));
        req.logOut();
        res.send(200);
    })

    // loggedin
    app.get("/node/loggedin", function(req, res)
    {
        console.log("IsLoggedIn request: %s\n", JSON.stringify(req.user));
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // signup
    app.post("/node/signup", function(req, res)
    {
        console.log("Signup request: %s\n", JSON.stringify(req.user));
        db.User.findOne(
        {
            username: req.body.username
        }, function(err, user)
        {
            if (user)
            {
                res.json(null);
                return;
            }
            else
            {
                var newUser = new db.User();
                newUser.username = req.body.username.toLowerCase();
                newUser.password = newUser.generateHash(req.body.password);
                newUser.save(function(err, user)
                {
                    req.login(user, function(err)
                    {
                        if (err)
                        {
                            return next(err);
                        }
                        res.json(user);
                    });
                });
            }
        });
    });
};
