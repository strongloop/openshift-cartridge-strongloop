var client = require('../client');
var debug = require('./debug');
var fs = require('fs');
var helper = require('./helper');
var net = require('net');
var path = require('path');
var server = require('../server');
var tap = require('tap');

function nop() {
  // no-op
}

tap.test('pipe listen busy', function(t) {
  var addr = 'a-pipe';

  helper.unlink(addr);
  var first = server.create(nop).listen(addr);
  
  first.on('listening', function() {
    var next = server.create(nop).listen(addr);
    next.on('error', function(er) {
      t.assert(er.message, 'errored');
      first.close(function() {
        t.assert(!fs.existsSync('a-pipe'), 'pipe closed');
        t.end();
      });
    });
  });
});

tap.test('tcp listen busy', function(t) {
  var addr = 0;

  var first = server.create(nop).listen(addr);
  
  first.on('listening', function() {
    var port = first.server.address().port;
    var next = server.create(nop).listen(port);
    next.on('error', function(er) {
      t.assert(er.message, 'errored');
      first.close(function() {
        t.end();
      });
    });
  });
});

tap.test('receive error', function(t) {
  var addr = 'a-pipe';
  var rpc = server.create(t.fail).listen(addr);
  
  rpc.on('listening', function() {
    net.connect(addr).end('}} garbage {{\n {helo:3}\n');
  });

  rpc.on('warn', function(er) {
    t.assert(er.message, 'errored');
    rpc.close(t.end.bind(t));
  });
});

tap.test('respond error', function(t) {
  var addr = 'a-pipe';
  var rpc = server.create(onRequest).listen(addr);
  var client;
  
  rpc.on('listening', function() {
    client = net.connect(addr)
    client.write('{}\n');
  });

  function onRequest(request, callback, ch) {
    client.end();
    client.on('close', function() {
      // verify channel socket is not writeable
      ch.once('error', function() {
        // closed/errored channels should discard response, with no error
        ch.once('error', t.fail);
        process.nextTick(function() {
          rpc.close(t.end.bind(t));
        });

        callback({msg: 'bye'});
      });
      // XXX sockets emit errors synchronously, probably a node bug, so write
      // after attaching error listener
      ch.socket.write('line\n');
    });
  }
});

tap.test('pipe address', function(t) {
  var addr = 'a-pipe';

  helper.unlink(addr);
  var first = server.create(nop).listen(addr);

  first.on('listening', function() {
    t.equal(path.basename(first.address().path), addr);
    first.close(function() {
      t.end();
    });
  });
});

tap.test('tcp address', function(t) {
  var addr = 0;

  var first = server.create(nop).listen(addr);

  first.on('listening', function() {
    t.assert(first.address().port > addr);
    first.close(function() {
      t.end();
    });
  });
});
