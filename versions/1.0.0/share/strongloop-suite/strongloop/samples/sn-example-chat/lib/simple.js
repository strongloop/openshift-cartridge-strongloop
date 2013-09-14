//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
function SimpleServer(obj) {
  if (!(this instanceof SimpleServer)) {
    return new SimpleServer(obj);
  }

  obj = obj || {};

  this.router = express();
  this.server = http.createServer(this.router);
  this.io = socketio.listen(this.server);

  this.port = obj.port || 1337;
  this.messages = [];
  this.sockets = [];

  this._initExpress();
  this._initSocketIo();
}
SimpleServer.createServer = SimpleServer;

//
// ## start `start([callback])`
//
// Starts the server, calling **callback** upon success or failure.
//
SimpleServer.prototype.start = start;
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
SimpleServer.prototype.updateRoster = updateRoster;
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
SimpleServer.prototype.broadcast = broadcast;
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
SimpleServer.prototype._initExpress = _initExpress;
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
SimpleServer.prototype._initSocketIo = _initSocketIo;
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

        self.broadcast('message', data);
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

module.exports = SimpleServer;
