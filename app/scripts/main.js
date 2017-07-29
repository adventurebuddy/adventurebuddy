/**
 * Main AngularJS Web Application
 */
var app = angular.module('adventureBuddyApp', ['ngRoute']);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    // Home
    .when("/", {templateUrl: "views/home.html", controller: "PageCtrl"})
    // Pages
    .when("/about", {templateUrl: "views/about.html", controller: "PageCtrl"})
    .when("/gallery", {templateUrl: "views/gallery.html", controller: "PageCtrl"})
    // // else 404
    .otherwise("/404", {templateUrl: "404.html", controller: "PageCtrl"});
}]);

/**
 *Controls all other Pages
 */
app.controller('PageCtrl', function (/* $scope, $location, $http */) {
  console.log("Page Controller reporting for duty.");
});
