// Use strict or jshint will bitch at us ======================================

'use strict';

// Main AngularJS Web Application =============================================
 
var app = angular.module('adventureBuddyApp', ['ngRoute']);

// Configure the Routes =======================================================
 
app.config(function ($routeProvider, $locationProvider) {
	
	// Make the location provider not randomly insert # and %2F in the URL
    $locationProvider.hashPrefix('');
	
	//Set up the routes
    $routeProvider
    // Home
    .when('/', {templateUrl: 'views/home.html', controller: 'PageCtrl'})
    // Pages
    .when('/about', {templateUrl: 'views/about.html', controller: 'PageCtrl'})
    .when('/gallery', {templateUrl: 'views/gallery.html', controller: 'PageCtrl'})
    .when('/tos', {templateUrl: 'views/terms.html', controller: 'PageCtrl'})
    .when('/privacy', {templateUrl: 'views/privacy.html', controller: 'PageCtrl'})
    .when('/login', {templateUrl: 'views/loginsignup.html', controller: 'PageCtrl'})
    // else 404
    .otherwise('/404', {templateUrl: '404.html', controller: 'PageCtrl'});
	
	//Get rid of the # in the URL.  This is unsupported in IE lt 10 so check.
	if(window.history && window.history.pushState)
	{
		$locationProvider.html5Mode(true);
	}
});

// Controls all other Pages ===================================================
 
app.controller('PageCtrl', function ($scope, $location, $http) {
  console.log('Page Controller reporting for duty.\nScope is:\n%s\nLocation is:\n%sHttp is:\n%s\n\n',$scope, $location, $http);
});

// Carousel handler ===========================================================

/**
 * This will intercept the right and left click icons on the carousel and
 * call the bootstrap handler before the angular route provider gets it.
 */

var handle_nav = function(e) {
	e.preventDefault();
	var nav = this;
	nav.parents('.carousel').carousel(nav.data('slide'));
};

$('.carousel').carousel({
			interval: 5000,
			pause: "hover",
			wrap: true
		})
		.on('click', '.carousel-control', handle_nav);
