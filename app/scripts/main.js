// Use strict or jshint will bitch at us ======================================

'use strict';

// Main AngularJS Web Application =============================================

var app = angular.module('adventureBuddyApp', ['ngRoute', 'vcRecaptcha']);

// Function to check if the user is logged in =================================

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
{
    var deferred = $q.defer();

    $http.get('node/login')
        .then(
            function successCallback(response)
            {
                $rootScope.errorMessage = null;
                var user = response.data;
                //User is Authenticated
                if (user !== '0')
                {
                    console.log('User %s is logged in.\n', JSON.stringify(user));
                    $rootScope.currentUser = user;
                    deferred.resolve();
                }
                //User is not Authenticated
                else
                {
                    console.log('You gotta log in first!\n');
                    $rootScope.errorMessage = 'You need to log in.';
                    $rootScope.currentUser = null;
                    deferred.reject();
                    $location.url('/login');
                }
            },
            function errorCallback()
            {
                console.log('Something fucked up!\n');
            }
        );
    return deferred.promise;
};

// Configure the Routes =======================================================

app.config(function($routeProvider, $locationProvider)
{

    // Make the location provider not randomly insert # and %2F in the URL
    $locationProvider.hashPrefix('');

    //Set up the routes
    $routeProvider
        // Home
        .when('/',
        {
            templateUrl: 'views/home.html',
            controller: 'PageCtrl'
        })
        // Pages
        .when('/about',
        {
            templateUrl: 'views/about.html',
            controller: 'PageCtrl'
        })
        .when('/gallery',
        {
            templateUrl: 'views/gallery.html',
            controller: 'PageCtrl'
        })
        .when('/tos',
        {
            templateUrl: 'views/terms.html',
            controller: 'PageCtrl'
        })
        .when('/privacy',
        {
            templateUrl: 'views/privacy.html',
            controller: 'PageCtrl'
        })
        .when('/signup',
        {
            templateUrl: 'views/signup.html',
            controller: 'SignupCtrl'
        })
        .when('/login',
        {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/confirm',
        {
            templateUrl: 'views/confirm.html',
            controller: 'PageCtrl'
        })
        .when('/profile',
        {
            templateUrl: 'views/profile.html',
            resolve:
            {
                logincheck: checkLoggedin
            }
        })
        // else 404
        .otherwise('/404',
        {
            templateUrl: '404.html',
            controller: 'PageCtrl'
        });

    //Get rid of the # in the URL.  This is unsupported in IE lt 10 so check.
    if (window.history && window.history.pushState)
    {
        $locationProvider.html5Mode(true);
        //TODO: this will probably just break in an old browser.
    }
});

// Controls the Navbar ========================================================

app.controller('PageCtrl', function($rootScope, $scope, $http, $location)
{

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };

    //Provides a callback for the logout button
    $scope.logout = function()
    {
        console.log('Logging out...\n');
        $http.delete('node/login')
            .then(function()
            {
                $rootScope.currentUser = null;
                $location.url('/');
            });
    };
});

// Controls the Signup page ===================================================

app.controller('SignupCtrl', function(vcRecaptchaService, $scope, $http, $rootScope, $location)
{
    //Initialize the signup form.
    $scope.months = ['--Month--', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $scope.daysInEachMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    $scope.days = ['--Day--'];
    for (var i = 1; i <= 31; i++)
    {
        $scope.days.push(i.toString());
    }
    $scope.years = ['--Year--'];
    var currentYear = new Date().getFullYear();
    for (i = 0; i < 121; i++)
    {
        $scope.years.push((currentYear - i).toString());
    }
    $scope.newuser = {
        username: '',
        email: '',
        email2: '',
        password: '',
        password2: '',
        dobMonth: $scope.months[0],
        dobDay: $scope.days[0],
        dobYear: $scope.years[0],
        agree: '',
        recaptchaResponse: ''
    };
    $scope.pswdStrengthMessage = 'Invalid';

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };

    //Saves the recaptcha widget id.  Required for SPAs.
    $scope.setRecaptchaWidgetId = function(widgetid)
    {
        $scope.recaptchaWidgetId = widgetid;
    };

    //Check if the username is valid
    $scope.checkUsernameValid = function(newuser)
    {
        $scope.usernameValidErrorMessage = '';
        if (newuser.username.length === 0)
        {
            $scope.usernameValidErrorMessage = 'You must enter a username.';
            return;
        }
        if (newuser.username.length < 6)
        {
            $scope.usernameValidErrorMessage = 'Username must be 6 or more characters long.';
            return;
        }
        var alphaNumRe = new RegExp('[^A-Za-z0-9]');
        if (alphaNumRe.test(newuser.username))
        {
            $scope.usernameValidErrorMessage = 'Username must contain only letters and numbers.';
        }
    };

    //Check if the email is valid
    $scope.checkEmailValid = function(newuser)
    {
        $scope.emailValidErrorMessage = '';
        var looksLikeAnEmail = new RegExp('.+@.+\\..+');
        if (!looksLikeAnEmail.test(newuser.email))
        {
            $scope.emailValidErrorMessage = 'Invalid email address.';
        }
    };

    //Check if the emails match
    $scope.checkEmailMatch = function(newuser)
    {
        $scope.emailMatchErrorMessage = '';
        if (newuser.email !== newuser.email2)
        {
            $scope.emailMatchErrorMessage += 'Emails do not match.';
        }
    };

    //Check if the password is valid
    $scope.checkPswdValid = function(newuser)
    {
        $scope.pswdValidErrorMessage = '';
        switch (zxcvbn(newuser.password).score)
        {
            case 0:
            case 1:
                $scope.pswdStrengthMessage = 'Weak';
                break;
            case 2:
                $scope.pswdStrengthMessage = 'Moderate';
                break;
            case 3:
                $scope.pswdStrengthMessage = 'Strong';
                break;
            default:
                $scope.pswdStrengthMessage = 'Very Strong';
        }
        $scope.pswdMatchErrorMessage = '';
        if (newuser.password.length < 8)
        {
            $scope.pswdMatchErrorMessage += 'Password must be at least 8 characters.';
            $scope.pswdStrengthMessage = 'Invalid';
        }
    };

    //Check if the passwords match
    $scope.checkPswdMatch = function(newuser)
    {
        $scope.pswdMatchErrorMessage = '';
        if (newuser.password !== newuser.password2)
        {
            $scope.pswdMatchErrorMessage += 'Passwords do not match.';
        }
    };

    //To comply with COPPA, if they are under 13 we cannot issue an error message.
    //Only issue an error message if the birthdate is not filled in or is invalid, 
    //like February 30th or something.

    //Check if the DOB Month is valid.
    $scope.checkDobMonthValid = function(newuser)
    {
        $scope.dobMonthValidErrorMessage = '';
        if (newuser.dobMonth === $scope.months[0])
        {
            $scope.dobMonthValidErrorMessage = 'You must select a month.';
        }
    };

    //Check if the DOB Year is valid.
    $scope.checkDobYearValid = function(newuser)
    {
        $scope.dobYearValidErrorMessage = '';
        if (newuser.dobYear === $scope.years[0])
        {
            $scope.dobYearValidErrorMessage = 'You must select a year.';
        }
    };

    //Check if the DOB Day is valid.
    $scope.checkDobDayValid = function(newuser)
    {
        $scope.dobDayValidErrorMessage = '';
        if (newuser.dobDay === $scope.days[0])
        {
            $scope.dobDayValidErrorMessage = 'You must select a day.';
            return;
        }
        for (var i = 1; i < $scope.months.length; i++)
        {
            if (newuser.dobMonth === $scope.months[i])
            {
                //TODO: check if it is a leap year
                if (newuser.dobDay > $scope.daysInEachMonth[i])
                {
                    $scope.dobDayValidErrorMessage = 'Invalid day of month.';
                }
                break;
            }
        }

    };

    //Check if they accepted the TOS
    $scope.checkTosValid = function(newuser)
    {
        $scope.tosErrorMessage = '';
        if (!newuser.agree)
        {
            $scope.tosErrorMessage = 'You must accept the terms of service.';
        }
    };

    //Check if they checked the reCaptcha
    $scope.checkRecaptchaChecked = function()
    {
        $scope.reCaptchaErrorMessage = '';
        if (vcRecaptchaService.getResponse($scope.recaptchaWidgetId) === '')
        {
            $scope.reCaptchaErrorMessage = 'You must complete the CAPTCHA.';
        }
    };

    //Handle the signup button
    $scope.signup = function(newuser)
    {
        //Validate the form input
        console.log('Validating form input %s...\n', JSON.stringify(newuser));
        $scope.checkUsernameValid(newuser);
        $scope.checkEmailValid(newuser);
        $scope.checkEmailMatch(newuser);
        $scope.checkPswdValid(newuser);
        $scope.checkPswdMatch(newuser);
        $scope.checkDobMonthValid(newuser);
        $scope.checkDobDayValid(newuser);
        $scope.checkDobYearValid(newuser);
        $scope.checkTosValid(newuser);
        $scope.checkRecaptchaChecked();

        //If it is valid,
        if ($scope.tosErrorMessage === '' &&
            $scope.usernameValidErrorMessage === '' &&
            $scope.emailMatchErrorMessage === '' &&
            $scope.pswdStrengthMessage !== 'Invalid' &&
            $scope.pswdMatchErrorMessage === '' &&
            $scope.dobYearValidErrorMessage === '' &&
            $scope.dobMonthValidErrorMessage === '' &&
            $scope.dobDayValidErrorMessage === '' &&
            $scope.tosErrorMessage === '' &&
            $scope.reCaptchaErrorMessage === '')
        {

            //Save the recaptcha response
            $scope.newuser.recaptchaResponse = vcRecaptchaService.getResponse($scope.recaptchaWidgetId);

            //Post to the signup URL
            console.log('Signing up new user %s...\n', JSON.stringify(newuser));
            $http.post('node/user', newuser)
                //Process the response
                .then(
                    function successCallback(response)
                    {
                        console.log('Response is %s...\n', JSON.stringify(response));
                        //If we were successful, save user data and redirect to profile page
                        if (response.data !== null)
                        {
                            $rootScope.currentUser = response.data;
                            $location.url('/confirm');
                        }
                        //If we failed, print an error message saying the user is already registered
                        else
                        {
                            console.log('Response is null, weird\n', JSON.stringify(response));
                            $scope.reCaptchaErrorMessage = 'Server error, please try again later.';
                        }
                    },
                    function errorCallback(response)
                    {
                        console.log('Response is %s...\n', JSON.stringify(response));
                        if (response.data !== null)
                        {
                            console.log('Error, response is:\n', JSON.stringify(response));
                            switch (response.data.errorcode)
                            {
                                case 1:
                                    $scope.usernameValidErrorMessage = 'That username is already registered.';
                                    break;
                                case 2:
                                    $scope.emailValidErrorMessage = 'That email is already registered.';
                                    break;
                                case 3:
                                    $scope.reCaptchaErrorMessage = 'Sorry, but Google tells us that you are a robot.  Try again later.';
                                    break;
                                case 4:
                                    $scope.reCaptchaErrorMessage = 'We were unable to send a verification email to your account.';
                                    break;
                                default:
                                    $scope.reCaptchaErrorMessage = 'Server error, please try again later.';
                            }
                        }
                        //If we failed, print an error message saying the user is already registered
                        else
                        {
                            console.log('Response is null, weird\n', JSON.stringify(response));
                            $scope.reCaptchaErrorMessage = 'Server error, please try again later.';
                        }
                    }
                );
        }
    };
});

// Controls the Login page ====================================================

app.controller('LoginCtrl', function($scope, $http, $rootScope, $location)
{
    //Initialize the login form.

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };

    //Provides a function to handle the login button
    $scope.login = function(user)
    {
        //Post to the login URL
        console.log('Logging in user %s...\n', JSON.stringify(user));
        $http.post('node/login', user)
            //Process the response
            .then(
                //If we were successful, save user data and redirect to profile page
                function successCallback(response)
                {
                    console.log('Response is %s...\n', JSON.stringify(response));
                    $rootScope.currentUser = response.data;
                    console.log('Now logged in as %s...\n', JSON.stringify($rootScope.currentUser));
                    $location.url('/profile');
                },
                //If we failed, handle the 401 and print an error message saying the username or password is wrong
                function errorCallback(response)
                {
                    console.log('Response is %s...\n', JSON.stringify(response));
					switch(response.data.errorcode)
					{
						case 1:
							console.log('Error: Incorrect username or password.\n');
							$scope.loginErrorMessage = 'Incorrect username or password.';
							break;
						case 2:
							console.log('Error: User has not verified email.\n');
							$scope.loginErrorMessage = 'You must verify your email first.  Please click the link in the email we sent.';
							break;
						case 3:
							console.log('Error: Something screwed up.\n');
							$scope.loginErrorMessage = 'Server Error.  Please try again later.';
							break;
					}
                }
            );
    };

});

// Carousel handler ===========================================================

/**
 * This will intercept the right and left click icons on the carousel and
 * call the bootstrap handler before the angular route provider gets it.
 */

var handleCarouselNav = function(e)
{
    e.preventDefault();
    var nav = this;
    nav.parents('.carousel').carousel(nav.data('slide'));
};

$('.carousel').carousel(
    {
        interval: 5000,
        pause: 'hover',
        wrap: true
    })
    .on('click', '.carousel-control', handleCarouselNav);
