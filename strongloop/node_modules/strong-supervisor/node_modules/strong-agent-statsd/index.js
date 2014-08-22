var debug = require('debug')('strong-agent-statsd');
var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Lynx = require('lynx');

module.exports = function (options) {
  options = options || {};
  var publisher = new Publisher(options.port, options.host, options.scope);

  function publish(name, value) {
    publisher.publish(name, value);
  };

  // Attach publisher to middleware so 'warn' event can be listened on.
  publish.publisher = publisher;

  return publish;
};

function Publisher(port, host, scope) {
  var self = this;

  this.port = port;
  this.host = host;
  this.scope = scope;

  // Lynx creates a new UDP socket if it isn't used for 1 second. This has
  // two problems:
  // 1. It forces sockets to be created every time we use one.
  // 2. It tickles a bug in v0.11 cluster causing the master to assert.
  // Work around this by creating the socket once, which Lynx supports.
  // Also, emulate Lynx's error handling, which it does only for its own
  // created sockets.
  this.socket = dgram.createSocket('udp4');
  this.socket.unref();
  this.socket.on('error', function (err) {
    err.reason  = err.message;
    err.f       = 'send';
    err.message = 'Failed sending the buffer';
    err.args    = arguments;
    self.onError(err);
    return;
  });

  this.stats = new Lynx(this.host, this.port, {
    scope: this.scope,
    on_error: this.onError.bind(this),
    socket: this.socket,
  });
}

util.inherits(Publisher, EventEmitter);

Publisher.prototype.onError = function onError(er) {
  debug('transport error:', er.stack || er);
  this.emit('warn', er);
};

// Report all metrics as 'gauge', unless last component of name is '.count'.
var COUNTED = /\.count$/;

Publisher.prototype.publish = function publish(name, value) {
  debug('metric %s=%s', name, value);
  if (COUNTED.test(name)) {
    this.stats.count(name, value);
    return
  }
  this.stats.gauge(name, value);
};
