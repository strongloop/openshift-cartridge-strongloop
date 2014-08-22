var assert = require('assert');
var common = require('./common');
var render = require('../');

var expected = common.fixture('strong-pm-0.6.conf');
var options = {
  name: 'strong-pm',
  author: 'Current User',
  description: 'Node application server',
  execpath: '/custom/path/to/node',
  script: '/custom/path/to/my/script.js',
  created: '2014-08-22T00:00:00.000Z',
  version: '0.6',
};
var result = null;

process.on('exit', function() {
  assert.strictEqual(result, expected);
});

render(options, function(err, job) {
  assert.ifError(err);
  result = job;
});
