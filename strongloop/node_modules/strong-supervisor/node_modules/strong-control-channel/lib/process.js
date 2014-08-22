// inter-process control channel

var assert = require('assert');
var debug = require('./debug')('process:' + process.pid);
var message = require('./message');
var util = require('util');

function Server(onRequest) {
  this._protocol = new message.Protocol(onRequest, debug);
}

// Attach to a child process.
Server.prototype.attach = function attach(target) {
  var self = this;

  self._target = target = target || process;
  self._onmessage = function(message) {
    self._protocol.process(message, target);
  }

  if (target === process) {
    debug('child %d attaching to parent', process.pid);
  } else {
    debug('parent %d attaching to child %d', process.pid, target.pid);
  }

  target.on('message', self._onmessage);

  return self;
};

Server.prototype.request = function request(request, callback) {
  assert(this._target, 'server not attached to a process');
  return this._protocol.request(this._target, request, callback);
};

function createServer(onRequest) {
  return new Server(onRequest);
}

// Short-cut for attaching in a child
function attach(onRequest, child) {
  return createServer(onRequest).attach(child);
}


exports.createServer = createServer;
exports.attach = attach;
