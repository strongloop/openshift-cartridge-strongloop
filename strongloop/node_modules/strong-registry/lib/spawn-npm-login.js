var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var quoteArg = require('./quote-arg');

/**
 * Spawn `npm login` with the given userconfig, inheriting input/output streams.
 * @param {string} userconfig
 * @returns {Promise} Promise that is resolved when the npm child process exits.
 */
module.exports = function spawnNpmLogin(userconfig) {
  return new Promise(function(resolve, reject) {
    var options = {
      env: process.env,
      stdio: 'inherit'
    };

    var file = 'npm';
    var args = ['login'];
    if (userconfig) {
      args.push('--userconfig');
      args.push(userconfig);
    }

    if (process.platform == 'win32') {
      var command = file + ' ' + args.map(quoteArg).join(' ');
      args = ['/s', '/c', '"' + command + '"'];
      file = 'cmd.exe';
      options.windowsVerbatimArguments = true;
    }

    var child = spawn(file, args, options);
    child.on('error', reject);
    child.on('exit', function(code, signal) {
      if (code || signal) {
        var msg = 'npm login failed: exit code ' + code + ' signal ' + signal;
        reject(new Error(msg));
      } else {
        resolve();
      }
    });
  });
};
