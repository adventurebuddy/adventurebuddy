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

To start local servers for NGINX, the Adventure Buddy node.js app, and mongodb, run startDevServers.bat from the root directory of the repository.  Note that node, nginx and mongod must be installed and on your system path.  Running this script will kill all active instances of node, mongod or nginx and then restart them, so if you are running grunt server or something like that it will die when you run this script.

Once the dev servers are running, you can test serve the pages using Grunt.  To serve the non-minified version on the local machine, run 'grunt serve'.  This will start a web server in the app folder and open your browser.

To serve the minified version on the local machine, run 'grunt serve:dist'.  This will start a web server in the dist folder and open your browser.

## Commands to deploy the app to the server

Log into the server and execute the following commands:

* cd /var/www/adventurebuddy
* git pull
* rm -rf node_modules
* rm -rf bower_components
* npm install
* bower install
* grunt
* sudo service adventurebuddy restart

Later we will need to deploy this more gracefully, but for right now this is fine... we'll want to take the server offline and show a maintenance page while we update, and then we'll have to figure out how to automate this process across the whole scaling group... sigh... opening another issue...
