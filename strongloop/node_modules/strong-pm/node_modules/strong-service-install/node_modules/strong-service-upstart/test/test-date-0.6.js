var assert = require('assert');
var common = require('./common');

var render = require('../');

var options = {
  name: 'strong-pm',
  author: 'Current User',
  description: 'Node application server',
  execpath: '/custom/path/to/node',
  script: '/custom/path/to/my/script.js',
  created: new Date(Date.UTC(2014, 7, 22)),
  version: '0.6',
};

var expected = common.fixture('strong-pm-0.6.conf');

var result = render(options);

assert.strictEqual(result, expected);
