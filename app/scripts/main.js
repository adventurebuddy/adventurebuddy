// Use strict or jshint will bitch at us ======================================

'use strict';

// Main AngularJS Web Application =============================================
 
var app = angular.module('adventureBuddyApp', ['ngRoute']);

// Function to check if the user is logged in =================================

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope) {
	var deferred = $q.defer();

	$http.get('node/loggedin')
		.then(
			function successCallback(response) {
				$rootScope.errorMessage = null;
				var user = response.data;
				//User is Authenticated
				if (user !== '0') {
					console.log('User %s is logged in.\n',JSON.stringify(user));
					$rootScope.currentUser = user;
					deferred.resolve();
				} 
				//User is not Authenticated
				else { 
					console.log('You gotta log in first!\n');
					$rootScope.errorMessage = 'You need to log in.';
					$rootScope.currentUser = null;
					deferred.reject();
					$location.url('/login');
				}
			},
			function errorCallback() {
				console.log('Something fucked up!\n');
			}
		);
	return deferred.promise;
};

// Configure the Routes =======================================================
 
app.config(function ($routeProvider, $locationProvider) {
	
	// Make the location provider not randomly insert # and %2F in the URL
    $locationProvider.hashPrefix('');
	
	//Set up the routes
    $routeProvider
    // Home
    .when('/', {templateUrl: 'views/home.html', controller: 'PageCtrl'})
    // Pages
    .when('/about',   {templateUrl: 'views/about.html',       controller: 'PageCtrl'})
    .when('/gallery', {templateUrl: 'views/gallery.html',     controller: 'PageCtrl'})
    .when('/tos',     {templateUrl: 'views/terms.html',       controller: 'PageCtrl'})
    .when('/privacy', {templateUrl: 'views/privacy.html',     controller: 'PageCtrl'})
    .when('/login',   {templateUrl: 'views/loginsignup.html', controller: 'LoginSignupCtrl'})
	.when('/profile', {templateUrl: 'views/profile.html',     resolve: {logincheck: checkLoggedin}})
    // else 404
    .otherwise('/404', {templateUrl: '404.html', controller: 'PageCtrl'});
	
	//Get rid of the # in the URL.  This is unsupported in IE lt 10 so check.
	if(window.history && window.history.pushState)
	{
		$locationProvider.html5Mode(true);
		//TODO: this will probably just break in an old browser.
	}
});

// Controls the Navbar ========================================================
 
app.controller('PageCtrl', function ($rootScope, $scope, $http, $location) {
	
	//Highlights the links as we move around.
	$scope.isActive = function (viewLocation) { 
		return viewLocation === $location.path();
    };
	
	//Provides a callback for the logout button
	$scope.logout = function() {
	  console.log('Logging out...\n');
      $http.post("node/logout")
        .then(function() {
          $rootScope.currentUser = null;
          $location.url("/");
        });
    };
});

// Controls the Login/Signup page =============================================

app.controller('LoginSignupCtrl', function($scope, $http, $rootScope, $location) {
  
	//Provides a function to handle the signup button
	$scope.signup = function(newuser) {
		//If the passwords match,
		if (newuser.password === newuser.password2) {
			//Post to the signup URL
			console.log('Signing up new user %s...\n',JSON.stringify(newuser));
			$http.post('node/signup', newuser)
			//Process the response
			.then(
				function successCallback(response) {
					console.log('Response is %s...\n',JSON.stringify(response));
					//If we were successful, save user data and redirect to profile page
					if(response.data!==null){
						$rootScope.currentUser = response.data;
						console.log('Now logged in as %s...\n',JSON.stringify($rootScope.currentUser ));
						$location.url("/profile");
					}
					//If we failed, print an error message saying the user is already registered
					else{
						console.log('Response is %s...\n',JSON.stringify(response));
						console.log('Error: Username is already registered.\n');
						$scope.signupErrorMessage = 'Error: Username is already registered.';
						$scope.loginErrorMessage = '';
						newuser.password = '';
						newuser.password2 = '';
						$scope.user.username = '';
						$scope.user.password = '';
					}
				}
			);
		}
		//Handle the case where the passwords do not match.
		else {
			console.log('Passwords did not match.\n');
			$scope.signupErrorMessage = 'Error: Passwords did not match.';
			$scope.loginErrorMessage = '';
			newuser.password = '';
			newuser.password2 = '';
			$scope.user.username = '';
			$scope.user.password = '';
		}	  
	}; 
  
	//Provides a function to handle the login button
	$scope.login = function(user) {
		//Post to the login URL
		console.log('Logging in user %s...\n',JSON.stringify(user));
		$http.post('node/login', user)
		//Process the response
		.then(
			//If we were successful, save user data and redirect to profile page
			function successCallback(response) {
				console.log('Response is %s...\n',JSON.stringify(response));
				$rootScope.currentUser = response.data;
				console.log('Now logged in as %s...\n',JSON.stringify($rootScope.currentUser ));
				$location.url("/profile");
			},
			//If we failed, handle the 401 and print an error message saying the username or password is wrong
			function errorCallback(response) {
				console.log('Response is %s...\n',JSON.stringify(response));
				console.log('Error: Incorrect username or password.\n');
				$scope.loginErrorMessage = 'Error: Incorrect username or password.';
				$scope.signupErrorMessage = '';
				user.password = '';
				$scope.newuser.username = '';
				$scope.newuser.password = '';
				$scope.newuser.password2 = '';
			}
		);
	};
  
});

// Carousel handler ===========================================================

/**
 * This will intercept the right and left click icons on the carousel and
 * call the bootstrap handler before the angular route provider gets it.
 */

var handleCarouselNav = function(e) {
	e.preventDefault();
	var nav = this;
	nav.parents('.carousel').carousel(nav.data('slide'));
};

$('.carousel').carousel({
			interval: 5000,
			pause: 'hover',
			wrap: true
		})
		.on('click', '.carousel-control', handleCarouselNav);
