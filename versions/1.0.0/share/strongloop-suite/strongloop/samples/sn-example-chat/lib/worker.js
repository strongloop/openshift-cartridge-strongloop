//
// # WorkerServer
//
// A more advanced version of the SimpleServer that uses clustering for scalability.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var mq = require('strong-mq');

//
// ## WorkerServer `WorkerServer(obj)`
//
// Creates a new instance of WorkerServer with the following options:
//  * `mq` - The ClusterMQ connection to operate over.
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
function WorkerServer(obj) {
  if (!(this instanceof WorkerServer)) {
    return new WorkerServer(obj);
  }

  obj = obj || {};

  this.router = express();
  this.server = http.createServer(this.router);

  var ioOpts = {};
  if (obj.ioStore) ioOpts.store = obj.ioStore;
  this.io = socketio.listen(this.server, ioOpts);

  this.mq = obj.mq || mq.create({
    provider: 'native'
  }).open();
  this.publish = this.mq.createPubQueue('chat');

  this.port = obj.port || 1337;
  this.messages = [];
  this.sockets = [];

  this._initExpress();
  this._initSocketIo();
  this._initClusterMq();
}
WorkerServer.createServer = WorkerServer;

//
// ## start `start([callback])`
//
// Starts the server, calling **callback** upon success or failure.
//
WorkerServer.prototype.start = start;
function start(callback) {
  var self = this;

  self.port = Number(process.env.PORT) || self.port;
  self.server.listen(self.port, callback);

  return self;
}

//
// ## updateRoster `updateRoster()`
//
// Forces an update of the chat roster.
//
WorkerServer.prototype.updateRoster = updateRoster;
function updateRoster() {
  var self = this;

  async.map(
    self.sockets,
    function(socket, callback) {
      socket.get('name', callback);
    },
    function(err, names) {
      self.broadcast('roster', names);
    }
  );

  return self;
}

//
// ## broadcast `broadcast(event, data)`
//
// Sends **event** and **data** to all connected clients.
//
WorkerServer.prototype.broadcast = broadcast;
function broadcast(event, data) {
  var self = this;

  self.sockets.forEach(function(socket) {
    socket.emit(event, data);
  });

  return self;
}

//
// ## _initExpress `_initExpress()`
//
// Internal use only.
//
// Establishes the Express routes.
//
WorkerServer.prototype._initExpress = _initExpress;
function _initExpress() {
  var self = this;

  self.router.use(express.static(path.resolve(__dirname, '..', 'client')));

  return self;
}

//
// ## _initSocketIo `_initSocketIo()`
//
// Internal use only.
//
// Establishes the Socket.IO API.
//
WorkerServer.prototype._initSocketIo = _initSocketIo;
function _initSocketIo() {
  var self = this;

  self.io.on('connection', function(socket) {
    self.messages.forEach(function(data) {
      socket.emit('message', data);
    });

    socket.emit('info', {
      pid: process.pid
    });

    self.sockets.push(socket);

    socket.on('disconnect', function() {
      self.sockets.splice(self.sockets.indexOf(socket), 1);
      self.updateRoster();
    });

    socket.on('message', function(msg) {
      var text = String(msg || '');

      if (!text) {
        return;
      }

      socket.get('name', function(err, name) {
        var data = {
          name: name,
          text: text
        };

        self.publish.publish(data, 'message');
        // self.broadcast('message', data);
        self.messages.push(data);
      });
    });

    socket.on('identify', function(name) {
      socket.set('name', String(name || 'Anonymous'), function(err) {
        self.updateRoster();
      });
    });
  });

  return self;
}

//
// ## _initClusterMq `_initClusterMq()`
//
// Internal use only.
//
// Establishes the queues used to scale the server.
//
WorkerServer.prototype._initClusterMq = _initClusterMq;
function _initClusterMq() {
  var self = this;

  self.mq.createSubQueue('chat').subscribe('message', function(msg) {
    self.broadcast('message', msg);
  });

  return self;
}

module.exports = WorkerServer;
