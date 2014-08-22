var assert = require('assert');
var dgram = require('dgram');
var statsd = require('./');
var util = require('util');

var server = dgram.createSocket('udp4');
var port;
var reported = [];
var expected = [];
var ok;

process.on('exit', function() {
  assert(ok, 'test not ok');
});

server.on('message', function(data) {
  console.log('reported: %s', data);
  reported.push(data.toString());

  checkIfPassed();
});

server.bind(listening);

function listening(er) {
  console.log('listening:', er || server.address());
  assert.ifError(er);
  port = server.address().port;
  test();
}

function test() {
  var publish = statsd({port: port});

  assert.equal(publish.publisher.port, port);

  publish.publisher.emit('you are an emitter');

  function write(name, value, type) {
    expected.push(util.format('%s:%d|%s', name, value, type));
    publish(name, value);
  }

  write('loop.count', 100, 'c');
  write('loop.something', 5.99, 'g');
  write('loop.count', 50, 'c');
  write('object.String.count', -10, 'c');
  write('object.String.size', -1029, 'g');
}

function checkIfPassed() {
  if (reported.length < expected.length) {
    console.log('waiting for more reports...');
    return;
  }
  console.log('reported:', reported);
  console.log('expected:', expected);
  assert.deepEqual(reported, expected);

  ok = true;
  server.close();
}
