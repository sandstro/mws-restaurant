# Google Developer Scholarship - Mobile Web Specialist Certification Course Project

#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview:

The **Restaurant Reviews** project will be incrementally converted from a static webpage to a mobile-ready web application.

In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

 In **Stage Two**, you will take the responsive, accessible design you built in **Stage One** and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using Lighthouse.

### How to run the project

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`.

3. Fork and clone [this server repository]()https://github.com/udacity/mws-restaurant-stage-2. You’ll use this server as an API.

#### Local API Server

The server depends on node.js LTS Version: v6.11.2 , npm, and sails.js. Please, make sure you have these installed before proceeding forward.

###### Install project dependancies
```Install project dependancies
# npm i
```

###### Install Sails.js globally
```Install sails global
# npm i sails -g
```

###### Start the server
```Start server
# node server
```

###### Get Restaurants
````
# curl "http://localhost:1337/restaurants"
````
###### Get Restaurants by id
````
curl "http://localhost:1337/restaurants/{3}"
````

## Gulp commands

To develop, run `gulp watch`.
To build, run `gulp dist`.
To compile scss, run `gulp style`.

**More tasks in gulpfile**

