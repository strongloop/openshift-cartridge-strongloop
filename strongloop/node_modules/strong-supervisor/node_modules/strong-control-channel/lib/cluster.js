// inter-cluster control channel

var assert = require('assert');
var cluster = require('cluster');
var clusterId = cluster.worker ? cluster.worker.id : '0';
var debug = require('./debug')('cluster:' + clusterId);
var message = require('./message');
var util = require('util');

function Server(onRequest) {
  this._protocol = new message.Protocol(onRequest, debug);
}

// Ensure all cluster messages are processed with the worker object that the
// response should be sent to.
//
// In a worker, there is only one worker, but in a master, we have to listen for
// the message event on each newly forked worker :-(
//
// Only one server can be attached (because there is only one instance of
// cluster module to attach to).
Server.prototype.attach = function attach() {
  var self = this;

  assert(!cluster._strongControlChannel);

  debug('attaching to cluster in pid %d', process.pid);

  cluster._strongControlChannel = self;

  // In a worker, messages come only from master.
  if (cluster.isWorker) {
    // Note that cluster.worker can't be used: see joyent/node#7998
    process.on('message', function(message) {
      self._protocol.process(message, cluster.worker);
    });

    return self;
  }

  // In a master, we need to listen for messages on all workers as they are
  // forked, and tell the message server which worker the message came from, as
  // well as any workers that were already forked.
  for (var id in cluster.workers) {
    listen(cluster.workers[id]);
  }

  cluster.on('fork', listen);

  function listen(worker) {
    worker.on('message', function(message) {
      self._protocol.process(message, worker);
    });
  }

  return self;
};

function Self(server, callback) {
  var self = this;
  this.send = function(message) {
    debug('self-send %s', debug.json(message));

    process.nextTick(function() {
      server._protocol.process(message, self);
    });
  }
}

// Send a single request, callbacks with err, response
//
// dst is either a cluster worker ID, or a process ID. In the master, it
// can be it's own process ID, or the (never valid in node) worker ID of 0,
// used to mean 'master'
Server.prototype.request = function request(dst, request, callback) {
  debug('dst %s request %s', dst, debug.json(request));

  if (cluster.isWorker) {
    if (dst !== 0)
      return;

    var worker = cluster.worker;
  } else {
    function isMatch(w) {
      if (w.id === dst || w.process.pid === dst) {
        return w;
      }
    }

    if (dst === 0 || dst === process.pid) {
      // Send to self,
      // fake this out with a wrapper that does the right thing for the request
      // and response send
      worker = new Self(this, callback);
    } else {
      for (var id in cluster.workers) {
        worker = isMatch(cluster.workers[id]);
        if (worker)
          break;
      }
    }
    if (!worker)
      return;
  }

  return this._protocol.request(worker, request, callback);
};

function attach(onRequest) {
  return createServer(onRequest).attach();
}

function createServer(onRequest) {
  return new Server(onRequest);
}

// usage:
//
// require('strong-control-channel/cluster')(onRequest);
//   or
// require('strong-control-channel/cluster').attach(onRequest);
//
// function onRequest(request, callback) {
//   callback({/* ...some response... */});
// });
//
module.exports = attach;
module.exports.createServer = createServer;
module.exports.attach = attach;
