var client = require('../client');
var debug = require('./debug');
var helper = require('./helper');
var server = require('../server');
var tap = require('tap');

// callback on listening
function echoServer(addr,callback) {
  var s = server.create(echo).listen(addr)
    .on('listening', callback);

  function echo(request, callback) {
    callback(request);
  }

  return s;
}

tap.test('pipe success', function(t) {
  var addr = 'a-pipe';
  var req = {cmd: 'HI', args: [1, 2, 3, {key: 'value'}]};

  helper.unlink(addr);

  var s = echoServer(addr, function() {
    var c = client.request(addr, req, function(er, rsp) {
      debug('req %j rsp %j', req, rsp);
      t.error(er);
      t.deepEqual(req, rsp);
      s.close(function() {
        t.end();
      });
    });
    t.assert(c, 'client');
  });
});

tap.test('tcp success', function(t) {
  var addr = 0;
  var req = {cmd: 'HI', args: [1, 2, 3, {key: 'value'}]};

  helper.unlink(addr);

  var s = echoServer(addr, function() {
    var port = s.server.address().port;
    debug('server on port %d', port);
    var c = client.request(port, req, function(er, rsp) {
      debug('req %j rsp %j', req, rsp);
      t.error(er);
      t.deepEqual(req, rsp);
      s.close(function() {
        t.end();
      });
    });
    t.assert(c, 'client');
  });
});

tap.test('pipe nexist', function(t) {
  client.request('no-such-pipe', {}, function(er, rsp) {
    t.equal(rsp, undefined);
    t.assert(er.message, 'errored');
    t.end();
  });
});

tap.test('tcp nexist', function(t) {
  helper.getUnusedPort(function(port) {
    client.request(port, {}, function(er, rsp) {
      t.equal(rsp, undefined);
      t.assert(er.message, 'errored');
      t.end();
    });
  });
});

// callback on listening
function garbageServer(addr,callback) {
  var s = server.create(echo).listen(addr)
    .on('listening', callback);

  function echo(request, callback, ch) {
    ch.socket.write('}} garbage }}\n');
  }

  return s;
}

tap.test('pipe garbage response', function(t) {
  var addr = 'a-pipe';
  var req = {cmd: 'HI'};

  helper.unlink(addr);

  var s = garbageServer(addr, function() {
    var c = client.request(addr, req, function(er, rsp) {
      t.equal(rsp, undefined);
      t.assert(er.message, 'errored');
      s.close(function() {
        t.end();
      });
    });
    t.assert(c, 'client');
  });
});

tap.test('tcp garbage response', function(t) {
  var addr = 0;
  var req = {cmd: 'HI'};

  var s = garbageServer(addr, function() {
    var port = s.server.address().port;
    debug('server on port %d', port);
    var c = client.request(port, req, function(er, rsp) {
      t.equal(rsp, undefined);
      t.assert(er.message, 'errored');
      s.close(function() {
        t.end();
      });
    });
    t.assert(c, 'client');
  });
});
