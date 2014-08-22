var assert = require('assert');
var ch = require('../process').attach(onRequest);
var net = require('net');

// Test that we can detect disconnect, and exit on parent exit or disconnect.
var keepAlive = net.createServer().listen(0);

process.on('disconnect', function() {
  console.log('Did our parent die, or does it just want us to go away?');
  process.exit(2);
});

function onRequest(request, callback) {
  console.log('child %d recv request %j', process.pid, request);

  var _callback = callback;

  callback = function(message) {
    console.log('child %d send response %j', process.pid, message);
    return _callback(message);
  };

  request.pid = process.pid;

  if (request.cmd === 'delay') {
    setTimeout(function() {
      request.message = 'delayed!';
      callback(request);
    }, request.delay);
    return;
  }
  if (request.cmd === 'echo') {
    request.message = 'echoed!';
    callback(request);
    return;
  }
  request.error = 'unsupported';
  callback(request);
}

console.log('child pid %d', process.pid);

process.nextTick(function() {
  console.log('child sends hello');

  ch.request({cmd: 'hello'}, function(response) {
    console.log('child recv hello => %j', response);
    assert.equal(response.cmd, 'hello');
  });

  console.log('child sends no-such-cmd');

  ch.request({cmd: 'no-such-cmd'}, function(response) {
    console.log('child recv no-such-cmd => %j', response);
    assert.equal(response.error, 'unsupported');
  });
});
