var Promise = require('bluebird');
var exec = Promise.promisify(require('child_process').exec);
var extend = require('util')._extend;
var debug = require('debug')('strong-registry:exec-npm');
var quoteArg = require('./quote-arg');

module.exports = function execNpm(args, options) {
  options = options || {};
  options.env = extend(
    {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
    },
    options.env
  );

  var command = 'npm ' + args.map(quoteArg).join(' ');
  debug(command);
  return exec(command, options)
    .spread(function(stdout, stderr) { logOutput(args, stdout, stderr); });
};


function logOutput(npmArgs, stdout, stderr) {
  var npmCmd = findNpmCommandInArgs(npmArgs);
  debug('%s stdout', npmCmd, stdout);
  debug('%s stderr', npmCmd, stderr);
}

function findNpmCommandInArgs(args) {
  var npmCmd = args.shift();
  while (/^--/.test(npmCmd)) {
    args.shift(); // param value
    npmCmd = args.shift(); // next arg
  }
  return npmCmd;
}
