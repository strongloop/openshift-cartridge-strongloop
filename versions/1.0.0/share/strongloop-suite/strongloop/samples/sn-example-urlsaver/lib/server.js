//
// # ContentServer
//
// A simple HTTP server that allows PUTting and GETting content via external URLs.
//
var http = require('http');
var express = require('express');
var Q = require('q');
var request = require('request');

//
// ## ContentServer `ContentServer(obj)`
//
// Creates a new instance of ContentServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
function ContentServer(obj) {
  if (!(this instanceof ContentServer)) {
    return new ContentServer(obj);
  }

  obj = obj || {};

  this.port = obj.port || 1337;

  this.router = express();
  this.server = http.createServer(this.router);
  this.pages = {};

  this._initExpress();
}
ContentServer.createServer = ContentServer;

//
// ## start `start([callback])`
//
// Starts the server, calling **callback** upon success or failure.
//
ContentServer.prototype.start = start;
function start(callback) {
  var self = this;

  self.port = Number(process.env.PORT) || self.port;
  self.server.listen(self.port, callback);

  return self;
}

//
// ## get `get(url)`
//
// GETs **url**, returning a Promise representing its HTML body.
//
ContentServer.prototype.get = get;
function get(url) {
  var self = this;

  return Q.nfcall(request.get, url).then(function(results) {
    // `results` is an Array here because Q resolves multi-value callbacks (like request's) into a single Array, since
    // Promises/A+ only allows a Promise to represent one value.
    return results[1];
  });
}

//
// ## _initExpress `_initExpress()`
//
// Internal use only.
//
// Establishes the Express routes.
//
ContentServer.prototype._initExpress = _initExpress;
function _initExpress() {
  var self = this;

  self.router.use(express.query());
  self.router.use(express.logger());

  self.router.put('/:id', function(req, res, next) {
    var id = req.params.id;
    var url = req.query.url || 'http://strongloop.com/';

    self.pages[id] = self.get(url);

    res.send(id);
  });

  self.router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    var promise = self.pages[id];

    if (!promise) {
      res.send(404, 'Not Found');
      return;
    }

    promise.then(function(body) {
      res.send(body);
    });
  });

  return self;
}

module.exports = ContentServer;
