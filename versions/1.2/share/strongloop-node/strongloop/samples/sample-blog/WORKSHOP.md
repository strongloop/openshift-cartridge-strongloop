Building sample-blog in 30 minutes
==================================

This document provides a step-by-step tutorial to help you understand how we build the sample-blog application using StrongLoop Node.

1. Create a skeleton web application
------------------------------------

    $ express (to be replaced by slnode create command)


2. Define data models using Mongoose schema
-------------------------------------------

* /models
  * blog.js
  * user.js
  
3. Configure and connect to MongoDB
-----------------------------------

* /
  * config.js

* /db
  * mongo-store.js  

4. Expose data services as REST APIs
------------------------------------ 

* /routes
  * resource.js
 
4.1 Add generic CRUD operations for data models

4.2 Register express routes to provide REST APIs

4.3 Enable CORS 
   
5. Enable authentication
------------------------

* /routes
  * auth.js
* /views
  * login.ejs
  * account.ejs
  
5.1 Set up passport local strategy to use MongoDB as the user database

5.2 Protect the urls

5.3 Login page

5.4 Account page
 
6. Add tests
------------

Add mocha test cases to /test and name them as <test>-mocha.js. 

In package.json, create a script:

    "scripts": {
      "test": "./node_modules/mocha/bin/mocha --timeout 30000 --reporter spec test/*-mocha.js --noAuth"
    },
  
7. Add client side stuff
------------------------

7.1 Routes for / and /post

7.2 Views for / and /post
  
8. Run the demo
---------------

8.1 Start mongodb

8.2 Set up the sample data

8.3 npm

8.4 node app
