# Adventure Buddy

This repository contains the source code for the Adventure Buddy website at www.adventure-buddy.com.  This project was scaffolded with [yo angular generator](https://github.com/yeoman/generator-angular) version 0.16.0.

## Setup

To install and build the front end, go install all of the required software as mentioned in the employee handbook.  Then perform the following steps:

* Open git bash.
* Clone this repository using 'git clone https://<username>@github.com/adventurebuddy/adventurebuddy.git'
* Run 'npm install -g grunt-cli bower yo generator-karma generator-angular'
* Run 'npm install'
* Run 'bower install'

Now you should be all ready to roll.

## Commands to run the server side

To run the server, run 'node server/server.js'.  You should run this while the client side is running to test server interactions.

## Commands to build the client side

To build, run 'grunt'.  This will minify and uglify all your scripts and css and put them in the /dist directory.

To serve the non-minified version on the local machine, run 'grunt serve'.  This will start a web server in the app folder and open your browser.

To serve the minified version on the local machine, run 'grunt serve:dist'.  This will start a web server in the dist folder and open your browser.

When done, you can upload the latest version to the server using a 'git pull' from the server.