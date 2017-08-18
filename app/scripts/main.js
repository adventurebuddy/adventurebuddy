// Use strict or jshint will bitch at us ======================================

'use strict';

// Main AngularJS Web Application =============================================

var app = angular.module('adventureBuddyApp', ['ngRoute', 'vcRecaptcha', 'ngAnimate']);

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
                console.log('Something broke!\n');
            }
        );
    return deferred.promise;
};

// Parse a query string =======================================================

function parseQueryString(query)
{
    var vars = query.split('&');
    var queryString = {};
    for (var i = 0; i < vars.length; i++)
    {
        var pair = vars[i].split('=');
        // If first entry with this name
        if (typeof queryString[pair[0]] === 'undefined')
        {
            queryString[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        }
        else if (typeof queryString[pair[0]] === 'string')
        {
            var arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        }
        else
        {
            queryString[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return queryString;
}

// Configure the Routes =======================================================

app.config(function($routeProvider, $locationProvider)
{

    // Make the location provider not randomly insert # and %2F in the URL
    $locationProvider.hashPrefix('');

    //Set up the routes
    $routeProvider
        // Home page
        .when('/',
        {
            templateUrl: 'views/home.html',
            controller: 'PageCtrl'
        })
        // About page
        .when('/about',
        {
            templateUrl: 'views/about.html',
            controller: 'PageCtrl'
        })
        //Gallery page
        .when('/gallery',
        {
            templateUrl: 'views/gallery.html',
            controller: 'PageCtrl'
        })
        //Terms of service
        .when('/tos',
        {
            templateUrl: 'views/terms.html',
            controller: 'PageCtrl'
        })
        //Terms of service
        .when('/privacy',
        {
            templateUrl: 'views/privacy.html',
            controller: 'PageCtrl'
        })
        //Signup page
        .when('/signup',
        {
            templateUrl: 'views/signup.html',
            controller: 'SignupCtrl'
        })
        //Login page
        .when('/login',
        {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        //Confirmation email sent
        .when('/confirm',
        {
            templateUrl: 'views/confirm.html',
            controller: 'PageCtrl'
        })
        //Email confirmed
        .when('/confirmed',
        {
            templateUrl: 'views/confirmed.html',
            controller: 'PageCtrl'
        })
        //Forgot password
        .when('/forgot',
        {
            templateUrl: 'views/forgot.html',
            controller: 'ForgotCtrl'
        })
        //Reset password
        .when('/reset',
        {
            templateUrl: 'views/reset.html',
            controller: 'ResetCtrl'
        })
        //User profile page
        .when('/profile',
        {
            templateUrl: 'views/profile.html',
            resolve:
            {
                logincheck: checkLoggedin
            },
            controller: 'ProfileCtrl'
        })
        //My adventures page
        .when('/adventures',
        {
            templateUrl: 'views/adventures.html',
            resolve:
            {
                logincheck: checkLoggedin
            },
            controller: 'PageCtrl'
        })
        //My places page
        .when('/places',
        {
            templateUrl: 'views/places.html',
            resolve:
            {
                logincheck: checkLoggedin
            },
            controller: 'PageCtrl'
        })
        //Adventure planner
        .when('/planner',
        {
            templateUrl: 'views/planner.html',
            resolve:
            {
                logincheck: checkLoggedin
            },
            controller: 'PageCtrl'
        })
        //Account settings
        .when('/settings',
        {
            templateUrl: 'views/settings.html',
            resolve:
            {
                logincheck: checkLoggedin
            },
            controller: 'PageCtrl'
        })
        //Error
        .when('/error',
        {
            templateUrl: 'views/error.html',
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
		signupmethod: '',
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
	
	//called when the user selects a signup method
	$scope.buttonCallback = function(method)
    {
		if($scope.newuser.signupmethod !== method)
		{
			console.log('Setting signup method to %s',method);
			$scope.newuser.signupmethod = method;
		}
		else
		{
			$scope.signupEmail($scope.newuser);
		}
    };
	
	//called to check current signup method
	$scope.isSignupMethod = function(method)
    {
        return $scope.newuser.signupmethod === method;
    };

    //Saves the recaptcha widget id.  Required for SPAs.
    $scope.setRecaptchaWidgetId = function(widgetid)
    {
        $scope.recaptchaWidgetId = widgetid;
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
        if (!newuser.password || newuser.password.length < 8)
        {
            $scope.pswdMatchErrorMessage = 'Password must be at least 8 characters.';
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
    $scope.signupEmail = function(newuser)
    {
        //Validate the form input
        console.log('Validating form input %s...\n', JSON.stringify(newuser));
		$scope.checkEmailValid(newuser);
		$scope.checkEmailMatch(newuser);
		$scope.checkPswdMatch(newuser);
		$scope.checkPswdValid(newuser);
        $scope.checkDobMonthValid(newuser);
        $scope.checkDobDayValid(newuser);
        $scope.checkDobYearValid(newuser);
        $scope.checkTosValid(newuser);
        $scope.checkRecaptchaChecked();

        //If it is valid,
        if ($scope.tosErrorMessage === '' &&
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
                        //If we were successful, save user data and redirect to profile page
                        if (response.data !== null)
                        {
                            console.log('Response is %s...\n', JSON.stringify(response));
                            $rootScope.confirmMessage = {
                                message: 'We\'ve sent an email to ' + response.data.email + '.  Please click the link in it to verify your account.',
                                linkhref: '/',
                                linktext: 'Back to the home page.',
                                heading: 'Signup Successful'
                            };
                            $location.url('/confirm');
                        }
                        //If we failed, print an error message
                        else
                        {
                            console.log('Response is null, weird\n', JSON.stringify(response));
                            $scope.reCaptchaErrorMessage = 'Server error, please try again later.';
                        }
                    },
                    function errorCallback(response)
                    {
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
	$scope.user = 
	{
		loginmethod:'',
		email:'',
		password:''
	};

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };
	
	//called when the user clicks the login with email button
	$scope.buttonCallback = function(method)
    {
		if($scope.user.loginmethod !== method)
		{
			console.log('Setting login method to %s',method);
			$scope.user.loginmethod = method;
		}
		else
		{
			$scope.login($scope.user,method);
		}
    };
	
	//called to check current signup method
	$scope.isLoginMethod = function(method)
    {
        return $scope.user.loginmethod === method;
    };

    //Provides a function to handle the login button
    $scope.login = function(user,method)
    {
		$scope.user.loginmethod = method;
		
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
                    switch (response.data.errorcode)
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

// Controls the Password reset pages ==========================================

app.controller('ForgotCtrl', function($rootScope, $scope, $http, $location)
{

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };

    //Callback for the reset password button
    $scope.resetPassword = function(email)
    {
        //Do some basic validation of the email string
        var looksLikeAnEmail = new RegExp('.+@.+\\..+');
        if (!email || email === '')
        {
            $scope.forgotErrorMessage = 'You must provide an email.';
            return;
        }
        if (!looksLikeAnEmail.test(email))
        {
            $scope.forgotErrorMessage = 'Invalid email.';
            return;
        }

        //Submit this email to the password reset link
        console.log('Resetting password for email %s...\n', email);
        $http.put('node/forgot',
            {
                email: email
            })
            //Process the response
            .then(
                //If we were successful, redirect the user to the confirm page
                function successCallback()
                {
                    $rootScope.confirmMessage = {
                        message: 'We\'ve sent an email to ' + email + '.  Please click the link in it to reset your password.  Please note that this link will expire after one hour.',
                        linkhref: '/',
                        linktext: 'Back to the home page.',
                        heading: 'Email Sent'
                    };
                    $location.url('/confirm');
                },
                //If we failed, provide feedback
                function errorCallback(response)
                {
                    console.log('Response is %s...\n', JSON.stringify(response));
                    switch (response.data.errorcode)
                    {
                        case 1:
                            console.log('Error: That email is not registered.\n');
                            $scope.forgotErrorMessage = 'That email is not registered.';
                            break;
                        default:
                            console.log('Error: Something screwed up.\n');
                            $rootScope.errorMessage = JSON.stringify(response);
                            $location.url('/error');
                            break;
                    }
                }
            );
    };

});

// Controls the Password reset pages ==========================================

app.controller('ResetCtrl', function($rootScope, $scope, $http, $location)
{
    //Get the query string
    var query = window.location.search.substring(1);
    var qs = parseQueryString(query);
    console.log('Got query id %s', qs.id);

    //Initialize the form values
    $scope.user = {
        resetString: qs.id,
        password: '',
        password2: ''
    };
    $scope.pswdStrengthMessage = 'Invalid';

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };

    //Check if the password is valid
    $scope.checkPswdValid = function(user)
    {
        $scope.pswdValidErrorMessage = '';
        switch (zxcvbn(user.password).score)
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
        if (user.password.length < 8)
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

    //Callback for the reset password button
    $scope.submitNewPassword = function(user)
    {
        //Validate the password.
        $scope.checkPswdValid(user);
        $scope.checkPswdMatch(user);

        //Submit this email to the password reset link
        console.log('Resetting password: %s\n', user);
        $http.put('node/reset', user)
            //Process the response
            .then(
                //If we were successful, redirect the user to the confirm page
                function successCallback()
                {
                    $rootScope.confirmMessage = {
                        message: 'Your password was successfully reset.',
                        linkhref: '/login',
                        linktext: 'Click here to log in.',
                        heading: 'Email Sent'
                    };
                    $location.url('/confirm');
                },
                //If we failed, provide feedback
                function errorCallback(response)
                {
                    console.log('Response is %s...\n', JSON.stringify(response));
                    switch (response.data.errorcode)
                    {
                        case 1:
                            console.log('Error: Link has expired.\n');
                            $scope.pswdMatchErrorMessage = 'Password reset link has expired.';
                            break;
                        default:
                            console.log('Error: Something screwed up.\n');
                            $rootScope.errorMessage = JSON.stringify(response);
                            $location.url('/error');
                            break;
                    }
                }
            );
    };

});

// Controller for profile page ================================================

var citiesMap;
var countriesMap;
var adventuresMap;
var placesMap;
var chartData;
var chartOptions;

app.controller('ProfileCtrl', function($rootScope, $scope, $http, $location)
{

    //Highlights the links as we move around.
    $scope.isActive = function(viewLocation)
    {
        return viewLocation === $location.path();
    };
    
    //Dummy data for places and adventures
    $scope.places=
    [
        {
            name:'Hawaii',
            position:{lat:21.3069,lng:-157.8583},
            type:'Past'
        },
        {
            name:'Annapolis',
            position:{lat:38.9784,lng:-76.4922},
            type:'Past'
        },
        {
            name:'Geiranger',
            position:{lat:62.1008,lng:7.2059},
            type:'Past'
        },
        {
            name:'Christmas Island',
            position:{lat:-10.4475,lng:105.6904},
            type:'WantToGo'
        }
    ];
    
    $scope.adventures=
    [
        {
            name:'Jamaica',
            position:{lat:18.1096,lng:-77.2975},
            type:'Past'
        },
        {
            name:'Mexico',
            position:{lat:21.1619,lng:-86.8515},
            type:'Past'
        },
        {
            name:'Caribbean Cruise',
            position:{lat:21.6940,lng:-71.7979},
            type:'Past'
        },
        {
            name:'Hawaii',
            position:{lat:21.3069,lng:-157.8583},
            type:'Past'
        },
        {
            name:'Iceland',
            position:{lat:64.9631,lng:19.0208},
            type:'Past'
        },
        {
            name:'Australia',
            position:{lat:-16.8167,lng:145.6333},
            type:'Past'
        },
        {
            name:'Grand Canyon',
            position:{lat:36.0544,lng:-112.1401},
            type:'Past'
        },
        {
            name:'Italy',
            position:{lat:41.8719,lng:12.5674},
            type:'Past'
        },
        {
            name:'Scandinavia',
            position:{lat:57.7089,lng:11.9746},
            type:'Past'
        },
        {
            name:'Eclipse Trip',
            position:{lat:35.2271,lng:-80.8431},
            type:'Upcoming'
        },
        {
            name:'Christmas Island',
            position:{lat:-10.4475,lng:105.6904},
            type:'WantToGo'
        }
    ];
    
    $scope.countries=
    [
        ['Country',          'places'],
        ['United States',    10],
        ['Canada',           10],
        ['Mexico',           10],
        ['Jamaica',          10],
        ['Turks and Caicos', 10],
        ['Bahamas',          10],
        ['Australia',        10],
        ['Portugal',         10],
        ['Austria',          10],
        ['Italy',            10],
        ['Vatican City',     10],
        ['San Marino',       10],
        ['Switzerland',      10],
        ['Sweden',           10],
        ['Norway',           10],
        ['Iceland',          10],
        ['United Kingdom',   1]
    ];
    
    $scope.cities=
    [
        ['Annapolis, MD, USA'              ,10],
        ['New York, NY, USA'               ,10],
        ['Springfield, IL, USA'            ,10],
        ['Chicago, IL, USA'                ,10],
        ['Denver, CO, USA'                 ,10],
        ['Geiranger, Norway'               ,10],
        ['Oslo, Norway'                    ,10],
        ['Alesund, Norway'                 ,10],
        ['Stavanger, Norway'               ,10],
        ['London, England'                 ,10],
        ['Lisbon, Portugal'                ,10],
        ['Rome, Italy'                     ,10],
        ['Florence, Italy'                 ,10],
        ['Milan, Italy'                    ,10],
        ['San Marino'                      ,10],
        ['Vatican City'                    ,10],
        ['Impruneta, Italy'                ,10],
        ['Venice, Italy'                   ,10],
        ['Pisa, Italy'                     ,10],
        ['Manarola, Italy'                 ,10],
        ['Zurich, Switzerland'             ,10],
        ['Stockholm, Sweden'               ,10],
        ['Visingso, Sweden'                ,10],
        ['Gothenburg, Sweden'              ,10],
        ['Parma, Italy'                    ,10],
        ['Sydney, Australia'               ,10],
        ['Palm Cove, Australia'            ,10],
        ['Cairns, Australia'               ,10],
        ['Reykjavik, Iceland'              ,10],
        ['Vik, Iceland'                    ,10],
        ['Kirkjubaejarklaustur, Iceland'   ,10],
        ['Keflavik, Iceland'               ,10],
        ['Hellnar, Iceland'                ,10],
        ['Bjarnarhofn, Iceland'            ,10]
    ];
    
    //Function to intialize the maps
    $scope.initMaps=function()
    {
		//Options for our google maps
		var mapOptions = 
		{
			draggable: false,
			scrollwheel: false,
			panControl: false,
			maxZoom: 2,
			minZoom: 2,
			zoom: 2,
			center: {lat:30,lng:0},
			disableDefaultUI: true
        }
    
        //Build the my adventures profile map
        adventuresMap = new google.maps.Map(document.getElementById('adventuresmap'), mapOptions);
        adventuresMap.setMapTypeId('hybrid');
		
        //Build the cities profile map
        citiesMap = new google.maps.Map(document.getElementById('citiesmap'), mapOptions);
        citiesMap.setMapTypeId('hybrid');
    
        //Build the my places profile map
        placesMap = new google.maps.Map(document.getElementById('placesmap'), mapOptions);
        placesMap.setMapTypeId('hybrid');
        
        //Populate an icon for each of my adventures
        for(var i=0;i<$scope.adventures.length;i++)
        {
            var color='lightgreen';
            if($scope.adventures[i].type==='WantToGo')
            {
                color='red';
            }
			else if ($scope.adventures[i].type==='Upcoming')
            {
                color='cyan';
            }
            
            var marker = new google.maps.Marker(
            {
              position: $scope.adventures[i].position,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor:color,
                fillColor:color,
                fillOpacity:1.0,
                scale:3
              },
              map: adventuresMap
            });
        }
        
        //Populate an icon for each of my places
        for(var i=0;i<$scope.places.length;i++)
        {
            var color='lightgreen';
            if($scope.places[i].type==='WantToGo')
            {
                color='red';
            }
			else if ($scope.adventures[i].type==='Upcoming')
            {
                color='cyan';
            }
            
            var marker = new google.maps.Marker(
            {
              position: $scope.places[i].position,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor:color,
                fillColor:color,
                fillOpacity:1.0,
                scale:3
              },
              map: placesMap
            });
        }
		
		//Build the my countries map
		//TODO:change this to also be a map, doesn't handle carousel resize well
		google.charts.load('current', {
		'packages':['geochart'],
		'mapsApiKey': 'AIzaSyC07pb48i3T49JNN8E24PdYZilf52f3nFw'
		});
		google.charts.setOnLoadCallback(function() 
		{
			chartData = google.visualization.arrayToDataTable($scope.countries);
			chartOptions = {
				defaultColor:'green',
				backgroundColor:'lightblue',
				datalessRegionColor:'#00bb00',
				legend:'none',
				colorAxis: {colors: ['#009900', 'green']}
			};
			countriesMap = new google.visualization.GeoChart(document.getElementById('countriesmap'));
			countriesMap.draw(chartData, chartOptions);
		});
		
		//Put in some code to re-render the google maps as the carousel page moves
		$('#mapCarousel').on('slid.bs.carousel', function (e) 
		{
			// Trigger the resize
			if(e.relatedTarget.children[0].id==='placesmap')
			{
				google.maps.event.trigger(placesMap, 'resize');
				placesMap.setCenter({lat:30,lng:0})
			}
			else if(e.relatedTarget.children[0].id==='adventuresmap')
			{
				google.maps.event.trigger(adventuresMap, 'resize');
				adventuresMap.setCenter({lat:30,lng:0})
			}
			else if(e.relatedTarget.children[0].id==='citiesmap')
			{
				google.maps.event.trigger(citiesMap, 'resize');
				citiesMap.setCenter({lat:30,lng:0})
			}
			else if(e.relatedTarget.children[0].id==='countriesmap')
			{
				countriesMap.draw(chartData, chartOptions)
			}
		});
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
    
function mapsLoaded()
{
    console.log('Maps script loaded.');
}
