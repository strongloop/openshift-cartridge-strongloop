#!/bin/env node
var express = require('express');

var slutils = require('./lib/utils/slutils.js');
var routes  = require('./lib/routes/routes.js');

/**
 *  For profiling with nodefly. Also add nodefly to package.json
 *  and for CloudFoundry, regenerate npm-shrinkwrap.json
 */
var NODEFLY_API_TOKEN = '';


/*!  {{{ section: 'API-Functions'  */

var StrongLoopApp = function() {
  /*  Scope.  */
  var self = this;


  /**
   *  Enable app profiling if Nodefly token is set.
   *
   *  @api  private
   */
  self._enableProfiling = function() {
    if (! NODEFLY_API_TOKEN) {
      slutils.log_message('No API token - profiler disabled.');
      return;
    }

    try {
      require('nodefly').profile(NODEFLY_API_TOKEN, self.app_name);
    } catch(err) { 
      slutils.log_message('ERROR enabling profiling - details=%s', err);
      slutils.log_message('Running app with profiler disabled.');
    }

  };  /*  End of function  _enableProfiling.  */


  /**
   *  Load app configuration and setup information we need to run the app.
   *
   *  @api  private
   */
  self._loadConfig = function() {
    /*  Only thing we really need is the app name.  */
    var cfg = { name: 'StrongLoop-SampleApp' };

    try { 
      cfg = require('./package.json');
    } catch(err) {
    }

    self.ipaddress = process.env.OPENSHIFT_SLS_IP ||
                     process.env.VCAP_HOST || '0.0.0.0';
    self.port      = process.env.OPENSHIFT_SLS_PORT ||
                     process.env.VCAP_PORT  || process.env.PORT || 3000;
    self.app_name  = cfg.name || 'StrongLoop-Sample-App';

    NODEFLY_API_TOKEN && self._enableProfiling();

  };  /*  End of function  loadConfig.  */


  /**
   *  Callback when process exits or receives a termination signal.
   *
   *  @param  {String}  Termination signal if any.
   *  @api    private
   */
  self._terminator = function(sig) {
    if (typeof(sig) === 'string') {
      slutils.log_message('Received %s - terminating app %s ...', sig,
                         self.app_name);
      process.exit(1);
    }

    slutils.log_message('App %s stopped', self.app_name);

  };  /*  End of function  _terminator.  */


  /**
   *  Initialize express and register routes and routing handlers.
   *
   *  @api  private
   */
  self._initializeAppServer = function() {
    self.app = express(); 
    self.app_routes = routes.getRoutes();
    
    self.app.set('views', __dirname + '/views');
    self.app.set('view engine', 'ejs');
    self.app.use(express.static(__dirname + '/public/') );
    self.app.use(express.favicon() );
    self.app.use(express.logger() );
    self.app.use(express.bodyParser() );
    self.app.use(express.methodOverride() );

    for (var method in self.app_routes) {
      for (var r in self.app_routes[method]) {
        self.app[method](r, self.app_routes[method][r]);
      }
    }

    self.initialized = true;
    return self.initialized;

  };  /*  End of function  _initializeAppServer.  */


  /**
   *  Initialize app - loads configuration, sets up termination handlers,
   *  creates express app and sets up app routes.
   *
   *  @api  public
   */
  self.initialize = function() {
    self._loadConfig();
    slutils.onTerminate(self._terminator);

    return self._initializeAppServer();

  };  /*  End of function  initialize.  */


  /**
   *  Start the application (server).
   *
   *  @api  public
   */
  self.start = function() {
    self.initialized || self.initialize();

    self.app.listen(self.port, self.ipaddress, function() {
      slutils.log_message('App %s started on %s:%d', self.app_name,
                          self.ipaddress, self.port);
    });
  };

};  /*  StrongLoopApp.  */


/*!
 * }}} // End of section API-Functions.
 * ---------------------------------------------------------------------
 */



/**
 *  main():  Application main code.
 */

/*  Create, initialize and start the StrongLoop 'sample' application.  */
var sl_app = new StrongLoopApp();
sl_app.initialize();
sl_app.start();

