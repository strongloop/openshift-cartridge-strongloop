// control channel client

var net = require('net');

var channel = require('./channel');
var debug = require('./debug')('client');
var toPipe = require('./pipe').toPipe;

// Send a single request, callbacks with err, response
function request(addr, request, callback) {
  addr = toPipe(addr);

  debug('connect to: %s send:', addr, request);

  var socket = net.connect(addr);
  var ch = channel.fromSocket(socket);

  ch.send(request);

  ch.once('message', function(response) {
    if (callback) {
      callback(null, response);
      callback = null;
      socket.end();
    }
  });

  ch.once('error', function(er) {
    if (callback) {
      callback(er);
      callback = null;
    }
  });

  return ch;
}

exports.request = request;
