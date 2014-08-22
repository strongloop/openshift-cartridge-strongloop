var assert = require('assert');
var async = require('async');
var path = require('path');


var IPC = {stdio: [0, 1, 2, 'ipc']};
var CHILD = require.resolve('./child.js');

var child = require('child_process').spawn(process.execPath, [CHILD], IPC);
var ch = require('../').process.createServer(onRequest).attach(child);

var ECHO = {cmd: 'echo'};
var HELO = {cmd: 'hello'};
var NULL = {};

var tests = [
  test(child, ECHO),
  test(child, ECHO),
  test(child, NULL, 'unsupported'),
];

function test(target, request, error) {
  return function(done) {
    ch.request(request, function(response) {
      console.log('dst %d req %j rsp %j should error? %s',
        child.pid, request, response, error);

      assert.equal(request.cmd, response.cmd);
      assert.equal(target.pid, response.pid);
      if (error) {
        assert.equal(error, response.error);
      }
      return done();
    });
  };
}

async.parallel(tests, function(err) {
  assert.ifError(err);
  child.disconnect();
  child.on('exit', function(status) {
    assert.equal(status, 2);
    ok = true;
  });
});

function onRequest(request, callback) {
  console.log('master recv request %j', request);

  request.pid = process.pid;

  if (request.cmd === HELO.cmd) {
    request.helo = 'from master';
  } else {
    request.error = 'unsupported';
  }

  console.log('master send response %j', request);

  return callback(request);
}

// Ensure we are exiting because tests are OK.

var ok;

process.on('exit', function(code) {
  assert(ok);
  console.log('PASS');
});
