var assert = require('assert');
var common = require('./common');

var render = require('../');

var options = {
  name: 'strong-pm',
  author: 'Current User',
  description: 'Node application server',
  execpath: '/custom/path/to/node',
  script: '/custom/path/to/my/script.js',
  created: '2014-08-22T00:00:00.000Z',
};

var expected = common.fixture('strong-pm-1.4.conf');

var result = render(options);

assert.strictEqual(result, expected);
