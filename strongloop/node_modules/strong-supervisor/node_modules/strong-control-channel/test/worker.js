var assert = require('assert');
var ch = require('../').cluster(onRequest);
var cluster = require('cluster');

function onRequest(request, callback) {
  console.log('worker %d recv request %j', cluster.worker.id, request);

  var _callback = callback;

  callback = function(message) {
    console.log('worker %d send response %j', cluster.worker.id, message);
    return _callback(message);
  };

  request.pid = process.pid;
  request.wid = cluster.worker.id;

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

console.log('worker id %d pid %d', cluster.worker.id, process.pid);

process.nextTick(function() {
  console.log('worker sends hello');

  ch.request(0, {cmd: 'hello'}, function(response) {
    console.log('worker recv hello => %j', response);
    assert.equal(response.cmd, 'hello');
  });

  console.log('worker sends no-such-cmd');

  ch.request(0, {cmd: 'no-such-cmd'}, function(response) {
    console.log('worker recv no-such-cmd => %j', response);
    assert.equal(response.error, 'unsupported');
  });
});
