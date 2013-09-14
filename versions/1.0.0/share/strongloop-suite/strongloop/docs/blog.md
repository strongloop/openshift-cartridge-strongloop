# Get the sample blog application

The sample blog application is installed by default at the following locations varied by the platforms.

 - **Linux (Deb & RPM)** - /usr/share/strongloop-suite/strongloop/samples/sn-example-blog
 - **MacOS** - /usr/local/share/strongloop-suite/strongloop/samples/sn-example-blog
 - **Windows (x64)** - C:\Program Files\StrongLoop Suite\strongloop\samples\sn-example-blog
 - **Windows (x86)** - C:\Program Files (x86)\StrongLoop Suite\strongloop\samples\sn-example-blog

If you are a git user, you can also clone it from the StrongLoop github repository:
    
    $ git clone git://github.com/strongloop/sn-example-blog.git
    
## Run the sample blog application

The sample blog application uses MongoDB to store blog entries and users. Before you run it, you'll have to install or configure MongoDB.

To install MongoDB, you can follow instructions [here](http://www.mongodb.org/downloads). Version **2.2.3** is recommended.

If you've just installed mongodb you can run it by going to the directory where you installed it and running:

    $ mkdir sample-blog-db
    $ bin/mongod --dbpath sample-blog-db

This creates a data directory called sample-blog-db and tells mongo to start and use that directory. If you already have a mongodb you want to use somewhere, you can edit the connection variables in sample-blog/config/config.js. Now you can start the sample-blog application as follows:

    $ cd sample-blog
    $ npm install (only required if you check out the source code from github)
    $ node app

You should see messages on the console:
    
    Sample blog server listening on port 3000
    MongoDB connection opened

Now try the following links inside your web browser:

 - View all posts -- http://localhost:3000
 - View all posts as JSON -- http://localhost:3000/rest/blogs
 - View all users as JSON -- http://localhost:3000/rest/users
 - Create a new post (username: strongloop, pw: password) -- http://localhost:3000/post

![Blog](http://strongloop.com/images/strongloop_blog.png)
 
Now that we know the application works as intended, let's look at the blog's structure to get an idea of how we arrived at the endpoint.

## Understand the architecture

The blog uses a model-view-controller setup. The following diagram illustrates the building blocks that consist of the application built with StrongLoop Suite.

![Architecture](http://strongloop.com/images/architecture_map.jpg)

## Walk through the application flow

Let's walk through what's behind the scenes so that you can better understand how all of the pieces work together. The first one is when you the hit [http://localhost:3000](http://localhost:3000) URL.

 1. The browser sends an HTTP GET / request to the StrongLoop Suite server.
 1. The Express route for / kicks in, and it invokes the 'index' function as the controller.
 1. The controller calls Mongoose blog model to retrieve all blog entries from MongoDB.
 1. The EJS template for home page is rendered with the data from step 3.
 1. The HTML response is sent back to the browser.

The second flow is more involved. When you hit the 'New Post' button, it will bring up the Blog posting page so that you can create a new blog. Again, there are multiple steps involved within the application.

 1. The browser sends an HTTP GET /post request to the StrongLoop Suite server.
 1. The Express authentication handler backed by Passport intercepts the request, as the /post URL is protected.
 1. Since the user hasn't logged in yet, a redirect to the Login page is sent back to the browser.
 1. The browser sends an HTTP GET /login request to StrongLoop Suite server.
 1. The Express route for /login kicks in, and it invokes the 'loginForm' function as the controller.
 1. The controller renders the login form from its EJS template. The HTML response is sent back to the browser.
 1. The user types in the user name/password and click on the 'Login'.
 1. The Express route for POST /login calls the passport module which in turn invokes the Mongoose User model to make sure it has a record matching the user name/password. If yes, it redirects the browser back to the blog post page.
 1. Now the user fills in the title/content and click on the 'Save' button.
 1. The browser sends an HTTP POST /post request to StrongLoop Suite server.
 1. The Express authentication handler intercepts the request again and it finds out the user is authenticated. It let the request continue to flow to the Express route for POST /post.
 1. The route calls Mongoose blog model to save the newly created blog into MongoDB and send a redirect to / back to the browser.
 1. Now the browser gets the [http://localhost:3000](http://localhost:3000) page as we described in the first flow. Your new post will show up at the top of the page.
 
## Build the sample-blog

When you reach this section, we assume that you now have a good understanding of the sample blog application written in Node.js. Are you interested in building your own? Let's go step by step to illustrate how we build the sample-blog application using StrongLoop Suite.

### 1. Create a skeleton web application

    $ slc create web sample-blog -mr

      create : sample-blog/app.js
      create : sample-blog/package.json
      create : sample-blog/public/stylesheets/style.css
      create : sample-blog/routes/index.js
      create : sample-blog/views/index.ejs
      create : sample-blog/db/config.js
      create : sample-blog/db/mongo-store.js
      create : sample-blog/models/user.js
      create : sample-blog/sample-blog
      create : sample-blog/routes/resource.js

    $ cd sample-blog
    $ slc install

This will create a simple Express based web application. There are several important files to explain:

`package.json` - is the node.js package descriptor. It defines the name, version and dependencies of the application.

`app.js` - is a JavaScript file serving as the main program for sample blog application. It creates a web server and registers Express routes and views.

### 2. Define data models using Mongoose schema

For the blog application, we need a persistent store to keep user data and blog entries. We choose MongoDB (http://www.mongodb.org) and the Mongoose (http://mongoosejs.com) module for node as the persistence layer.

To start, we need to define the blog and user schemas using Mongoose so that we can create, retrieve, update, and delete the corresponding entities easily. For example, user will have properties such as username, password, first name, last name, and email. Blog will have properties such as author, title, content, and comments. See http://mongoosejs.com/docs/guide.html for more information.

There are two models needed for the blog application:

 - models/blog.js
 - models/user.js

<!-- break -->

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var CommentSchema = new Schema({
        author:{type:String, index: true},
        body:{type:String},
        date:{type:Date, default: new Date()}
    });
    var BlogSchema = new Schema({
        title:{type:String, index: true},
        body:{type:String},
        author:{type:String, index: true},
        date:{type:Date, default: new Date()},
        tags:{type:[String], index: true},
        comments: [CommentSchema]
    });

### 3. Configure and connect to MongoDB

We have covered how to install a new MongoDB database or reuse and existing one in previous sections. To make it easy to make changes, we abstract the MongoDB related configuration into an object inside config/config.js. The relevant snippet is:

    exports.creds = {
      mongo: {
        'hostname': 'localhost',
        'port': 27017,
        'username': '',
        'password': '',
        'db': 'sample-blog_development'
      }
    }

There is also code that reads the configuration and create connection to the given MongoDB database. The file is db/mongo-store.js.

### 4. Expose data services as REST APIs

Now we have the blog model defined. Can we access the blog entries remotely using REST APIs? Yes! With Mongoose and Express, it's actually pretty straightforward.

We use HTTP POST /rest/blogs to create a new blog entry. First, we add new function create as follows:

    /**
     * Create a new entity */
    exports.create = function(mongoose) {
      var mongo = mongoose;
      return function(req, res, next) {
          var mongoModel = mongo.model(req.params.resource);
          if(!mongoModel) {
              next();
              return;
          }
          mongoModel.create(req.body, function (err, obj) {
              if (err) {
                  console.log(err);
                  res.send(500, err);
              }
              else {
                  res.send(200, obj);
              }
          });
      };
    }

Interestingly, the create function can be used to create instances against any defined Mongoose models as it uses the resource name to look up the schema. The body of the HTTP request is the JSON representation of the entity.

Now we need to tell Express that the create function will be used to handle HTTP POST to /rest/:resource URLs. The registration is just one line of code:

    // Create a new entity
    app.post('/rest/:resource', exports.create(mongoose));
   
The corresponding file for our sample application is /routes/resource.js. You can find all CRUD operations are supported:

<table class="standard_table">
  <tbody>
    <tr>
      <td><strong>HTTP Verb</strong></td>
      <td><strong>URL Pattern</strong></td>
      <td><strong>MongoDB Operation</strong></td>
    </tr>
    <tr>
      <td>POST</td>
      <td>/rest/:resource</td>
      <td>Create a new document</td>
    </tr>
    <tr>
      <td>GET</td>
      <td>/rest/:resource?skip=&amp;limit=</td>
      <td>List all documents for the given collection. Optionally, skip and limit
      parameters can be provides from the query string to support pagination</td>
    </tr>
    <tr>
      <td>GET</td>
      <td>/rest/:resource/:id</td>
      <td>Retrieve a document by id</td>
    </tr>
    <tr>
      <td>PUT</td>
      <td>/rest/:resource/:id</td>
      <td>Update a document by id</td>
    </tr>
    <tr>
      <td>DELETE</td>
      <td>/rest/:resource/:id</td>
      <td>Delete a document by id</td>
    </tr>
  </tbody>
</table>

### 5. Enable authentication

On the Internet, certain web pages or APIs need to be protected so that only authorized users can access them. For example, we will secure the REST APIs as well as the blog post page so that only logged in users can create blog posts.

Luckily, with Express and Passport (http://passportjs.org) modules, the job is not difficult. There are a few simple steps to enable authentication.

#### 1. Define a passport strategy so that it knows which authentication mechanism to use. In our case, we use the user collection from the MongoDB. It's defined in routes/auth.js.

    passport.use(new LocalStrategy(function(username, password, done) {
      User.findByUsernamePassword(username, password, function(err, user) {
          if (err) {
              return done(err);
          }
          if (!user) {
              return done(null, false);
          }
          return done(null, user);
      });
    }));

#### 2. We also need to have a few forms/pages to deal with login, logout, and account information. These are modeled as Express views and routes too. See views/account.ejs and views/login.ejs.

#### 3. Glue all the pieces together

    /**
     * Set up the login handler
     */
    exports.setup = function(app) {
      app.use(passport.initialize());
      app.use(passport.session());
      app.all('/post', function(req, res, next) {
          console.log(req.path);
          if (req.path === "/login") {
              next();
          } else {
              ensure.ensureLoggedIn('/login')(req, res, next);
          }
      });
      app.get('/login', exports.loginForm);
      app.post('/login', exports.login);
      app.get('/logout', exports.logout);
      app.get('/account', exports.account);
    };

#### 6. Add test cases

Developing an application cannot go well without test cases. There are various test frameworks for Node.js. We use mocha (http://visionmedia.github.com/mocha) for the sample application. Typically, you can add test cases to /test folder and name them as `*- mocha.js`.

In package.json, create a script so that you can use "npm test" to run the test cases.

    "scripts": {
      "start": "node app",
      "test": "./node_modules/mocha/bin/mocha --timeout 30000 --reporter spec test/*-mocha.js --noAuth"
    }
   
#### 7. Add client-side artifacts

At this point, we pretty much have all the backend code ready for the blog application. If you are comfortable with REST APIs, you can definitely start to use 'curl' scripts to try out the blog functions. It would be nice to have simple UI to list blog entries, add comments, and create new entries.

Here is the list of artifacts we add to provide the UI.

views/index.ejs: The EJS template for index page that lists all blog entries. It take an array of blog entries.
views/post.ejs: The form to post new blog entries.
There are peers of these two views in Express routes:

routes/index.js: Define the functions to list blog entries and update them with new comments.
routes/post.js: Define the functions to render post form and create new blog entries.
The routes also register URLs, such as:

    exports.setup = function(app) {
      app.get('/', exports.index);
      app.post('/postComment', exports.postComment);
    };
    exports.setup = function(app) {
      app.get('/post', exports.post);
      app.post('/post', exports.save);
    };
   
The last piece of the puzzle is static assets, such as HTML files, images, or CSS sheets. We place them under /public and register a static handler with Express in app.js as follows:

    app.use(express.static(path.join(__dirname, 'public')));

#### 8. Run the demo

**Finally, it's demo time!**

    $ cd sample-blog
    $ mkdir sample-blog-db
    $ mongod --dbpath=sample-blog-db
    $ slc install
    $ node app

Enjoy the blog application at: [http://localhost:3000/](http://localhost:3000/)
