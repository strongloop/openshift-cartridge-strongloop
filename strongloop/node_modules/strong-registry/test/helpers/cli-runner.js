var Promise = require('bluebird');
var util = require('util');
var extend = util._extend;
var nexpect = require('nexpect');
var sandbox = require('./sandbox');

module.exports = exports = CliRunner;

/**
 * Configure a new run of sl-registry CLI.
 * @param {Array} args Command line arguments, e.g. 'add name url'
 * @param {Object} options Options for nexpect.spawn.
 * @constructor
 */
function CliRunner(args, options) {
  if (typeof args === 'string') {
    args = args.split(' ');
  } else if (!util.isArray(args)) {
    options = args;
    args = [];
  } else if (!args) {
    args = [];
  }

  options = options || {};
  options.env = extend(
    {
      PATH: process.env.PATH,
      HOME: CliRunner.HOME,
      USERPROFILE: CliRunner.HOME,
    },
    options.env
  );

  if (/nexpect/.test(process.env.DEBUG))
    options.verbose = true;

  options.stripColors = true;

  var cli = require.resolve('../../bin/sl-registry.js');
  args.unshift(cli);
  args.unshift(process.execPath);
  this.spawn = nexpect.spawn(args, options);
  this.expectedExitCode = 0;
}

CliRunner.HOME = sandbox.PATH;

/**
 * Execute CLI as configured.
 * @returns {Promise}
 */
CliRunner.prototype.run = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.spawn
      .sendEof()
      .run(function(err, stdout, exitcode) {
        if (err) return reject(err);

        if (exitcode != self.expectedExitCode) {
          var msg = 'Expected exit code ' + exitcode +
            ' to equal ' + self.expectedExitCode;
          return reject(new Error(msg));
        }

        resolve(stdout);
      });
  });
};

/**
 * Expect that the next line of output contains line as a sub-string,
 * fail if it does not.
 * @param {string|RegExp} line
 * @returns {CliRunner}
 */
CliRunner.prototype.expect = function(line) {
  this.spawn.expect(line);
  return this;
};

/**
 * Expect that the next line of output contains line as a sub-string,
 * fail if it does not.
 * @param {string|RegExp} line
 * @returns {CliRunner}
 */
CliRunner.prototype.waitFor = function(line) {
  this.spawn.wait(line);
  return this;
};

/**
 * Add a "write line" directive to the current chain.
 * @param {string=} line
 * @returns {CliRunner}
 */
CliRunner.prototype.sendLine = function(line) {
  if (line === undefined) line = '';
  this.spawn.sendline(line);
  return this;
};

/**
 * Close the input stream of the CLI process.
 * This method is automatically called by run().
 * @returns {CliRunner}
 */
CliRunner.prototype.sendEof = function() {
  this.spawn.sendEof();
  return this;
};

/**
 * Wait until the next line is the first line of the list of available
 * configurations.
 * @returns {CliRunner}
 */
CliRunner.prototype.waitForAvailableConfigurations = function() {
  return this.waitFor('Available configurations:');
};

/**
 * Expect the process to exit with the given exit code.
 * @param {number} value
 * @returns {CliRunner}
 */
CliRunner.prototype.expectExitCode = function(value) {
  this.expectedExitCode = value;
  return this;
};
