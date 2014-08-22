var assert = require('assert');
var async = require('async');
var cluster = require('cluster');

cluster.setupMaster({exec: require.resolve('./worker')});

// To ensure that we listen for messages on pre-existing workers, as well as any
// workers forked after we attach to cluster, we fork one, attach, then fork
// another.
var jun = cluster.fork();
var ch = require('../').cluster(onRequest);
var leo = cluster.fork();

var master = { // fake Worker for master, to compare against in test()
  id: 0,
  process: {
    pid: process.pid
  }
};

var ECHO = {cmd: 'echo'};
var HELO = {cmd: 'hello'};
var NULL = {};

var tests = [
  test(jun, jun.id, ECHO),
  test(leo, leo.id, ECHO),
  test(jun, jun.process.pid, ECHO),
  test(leo, leo.process.pid, ECHO),
  test(leo, leo.id, NULL, 'unsupported'),
  test(jun, jun.process.pid, NULL, 'unsupported'),
  test(master, 0, HELO),
  test(master, process.pid, HELO),
  test(master, 0, NULL, 'unsupported'),
  test(master, process.pid, NULL, 'unsupported'),
];

function test(worker, dst, request, error) {
  return function(done) {
    ch.request(dst, request, function(response) {
      console.log('dst %d req %j rsp %j should error? %s',
        dst, request, response, error);

      assert.equal(request.cmd, response.cmd);

      if (worker) {
        assert.equal(worker.id, response.wid);
        assert.equal(worker.process.pid, response.pid);
      }
      if (error) {
        assert.equal(error, response.error);
      }
      return done();
    });
  };
}

async.parallel(tests, function(err) {
  assert.ifError(err);
  cluster.disconnect();
  ok = true;
});

function onRequest(request, callback) {
  console.log('master recv request %j', request);

  request.wid = 0;
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
  if (code === 0) {
    assert(ok);
    console.log('PASS');
  }
});
