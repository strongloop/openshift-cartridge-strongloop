#!/usr/bin/env node

require('strong-agent').profile();

/**
 * If configured as a cluster master, just start controller.
 */

var control = require('strong-cluster-control');
var options = control.loadOptions();

if (options.clustered && options.isMaster) {
  return control.start(options);
}

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , resource = require('./routes/resource')
  , auth = require('./routes/auth')
  , post = require('./routes/post')
  , index = require('./routes/index')
  , http = require('http')
  , path = require('path')
  , config = require('./config/config.js')
  , mongo = require('./db/mongo-store.js')
  , setup = require('./app-setup.js');


/**
 * Define a callback to set up CORS related headers
 */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.cors.allowedDomains || '*');
    res.header('Access-Control-Allow-Methods', config.cors.allowedMethods || 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders || '*');
    //deal with OPTIONS method
    if (req.method == 'OPTIONS') {
      res.send(200);
    } else {
      next();
    }
};

var app = express();
module.exports = app;

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  if (config.demo.enabled === true) {
    setup.run();
  }
  if (config.auth.enabled === true) {
    auth.setup(app);
  }
  app.use(allowCrossDomain);
  app.use(app.router);
  index.setup(app);
  post.setup(app);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

//app.get('/', routes.index);

// Set up the resource CRUD REST Apis
resource.setup(app, mongo.mongoose);

// Start to listen on the HTTP port
http.createServer(app).listen(app.get('port'), function() {
  console.log('Sample blog server listening on port ' + app.get('port'));
});
