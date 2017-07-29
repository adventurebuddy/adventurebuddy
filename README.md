#Adventure Buddy

This repository contains the source code for the Adventure Buddy website at www.adventure-buddy.com.  This project was scaffolded with [yo angular generator](https://github.com/yeoman/generator-angular) version 0.16.0.

## Setup

Clone this repository using 'git clone https://<username>:<secretpassword>@github.com/adventurebuddy/adventurebuddy.git'

Run 'npm install grunt-karma karma karma-phantomjs-launcher karma-jasmine jasmine-core phantomjs --save-dev'

Now you should be all ready to roll.

## Directory structure

## Commands to run the server side

To run the server, run 'node server/server.js'.  You should run this while the client side is running to test server interactions.

## Commands to build the client side

To build, run 'grunt'.  This will minify and uglify all your scripts and css and put them in the /dist directory

To serve the non-minified version on the local machine, run 'grunt serve'.  This will start a web server in the app folder and open your browser.

To serve the minified version on the local machine, run 'grunt serve:dist'.  This will start a web server in the dist folder and open your browser.

When done, you can upload the minified version in the dist folder to the server using WinSCP.