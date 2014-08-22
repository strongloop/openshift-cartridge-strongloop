var assert = require('assert');
var util = require('util');
var path = require('path');
var fs = require('fs');

var upstartMaker = require('strong-service-upstart');
var uidNumber = require('uid-number');
var mkdirp = require('mkdirp');
var debug = require('debug')('strong-service-installer');
var shell = require('shell-quote');
var which = require('which');
var async = require('async');

module.exports = install;

function install(opts, cb) {
  var steps = [
    dryRunCheck,
    optionsPrecheck,
    resolveCommand,
    normalizeOptions,
    checkExistingJob,
    generateJob,
    ensureJobFileDir,
    ensureWorkingDir,
    writeJob,
  ].map(logCall);
  async.applyEachSeries(steps, opts, function(err) {
    if (err)
      return cb(err);
    console.log('Service %s installed (%s)', opts.name, opts.jobFile);
    cb(null, util.format('%s (%s)', opts.name, opts.jobFile));
  });

  function logCall(fn) {
    return function(opts, cb) {
      debug('enter %s', fn.name);
      fn(opts, function(err) {
        debug('exit %s (%s)', fn.name, err && err.message);
        cb.apply(this, arguments);
      });
    }
  }
}

function dryRunCheck(opts, next) {
  if (opts['dry-run'] || opts.dryRun || opts.n) {
    console.log('dry-run mode');
    opts.writeFile = opts.writeFile || fakeWriteFile;
    opts.mkdirp = opts.mkdirp || fakeMkdirp;
    opts.chown = opts.chown || fakeChown;
  } else {
    opts.writeFile = opts.writeFile || fs.writeFile;
    opts.mkdirp = opts.mkdirp || mkdirp;
    opts.chown = opts.chown || fs.chown;
  }
  setImmediate(next);
}

function optionsPrecheck(opts, next) {
  var errors = [];

  if (!opts.command && !opts.name) {
    errors.push('Missing command or name');
  }

  if (errors.length > 0)
    return setImmediate(next, new Error(errors.join(', ')));
  else
    setImmediate(next);
}

// Split a command string into it's base components for strong-service-upstart
// command './bin/myapp.js --flag --two 2'
//  -> execPath: '/path/to/node'
//  -> script: ['/path/to/bin/myapp.js', '--flag', '--two', '2']
// command 'global-cmd sub-cmd --flag --two 2'
//  -> execPath: '/path/to/global-cmd' (resolved from $PATH)
//  -> script: ['sub-cmd', '--flag', '--two', '2']
function resolveCommand(opts, next) {

  // If opts.command is given by CLI it is most certainly a string
  if (!Array.isArray(opts.command)) {
    opts.command = shell.parse(opts.command);
  }

  which(opts.command[0], function(err, fromPath) {
    if (err)
      return maybeLocal();
    if (!opts.execPath) {
      // exec + script = command
      opts.execPath = fromPath;
      opts.script = opts.command.slice(1);
    }
    return next();
  });

  function maybeLocal() {
    var local = path.resolve(opts.command[0]);
    fs.exists(local, function(exists) {
      if (exists) {
        // exec + script = node + expanded path + args
        opts.execPath = opts.execPath || process.execPath;
        opts.script = [local].concat(opts.command.slice(1));
      } else {
        return next(new Error('Could not resolve command:', opts.command));
      }
    });
  }
}

function normalizeOptions(opts, next) {
  if (!opts.name) {
    opts.name = path.basename(opts.script[0] || opts.execPath);
  }

  // strong-service-upstart requires a string for script
  if (Array.isArray(opts.script)) {
    opts.script = shell.quote(opts.script);
  }

  if (!opts.jobFile) {
    opts.jobFile = '/etc/init/' + opts.name + '.conf';
  }

  // ensure absolute path
  opts.jobFile = path.resolve(opts.jobFile);

  setImmediate(next);
}


function checkExistingJob(opts, next) {
  fs.exists(opts.jobFile, function(exists) {
    if (exists) {
      if (opts.force) {
        console.log('Warning: overwriting file "%s"', opts.jobFile);
      } else {
        return next(new Error('Job file "' + opts.jobFile + '" exists. Move it or re-run with --force to overwrite.'));
      }
    }
    next();
  });
}

function generateJob(opts, next) {
  upstartMaker(opts, function(err, job) {
    if (!err)
      opts.generatedJob = job;
    next(err);
  });
}

function ensureJobFileDir(opts, cb) {
  var dir = path.dirname(opts.jobFile);
  opts.mkdirp(dir, {}, function(err, made) {
    if (!err && made)
      console.log('created %s...', made);
    cb(err);
  });
}

function ensureWorkingDir(opts, cb) {
  if (!opts.cwd)
    return setImmediate(cb);
  opts.mkdirp(opts.cwd, {}, function(err, made) {
    if (!err && made) {
      console.log('created %s...', made);
      uidNumber(opts.user, opts.group, function(err, uid, gid) {
        if (err)
          return cb(err);
        opts.chown(made, uid, gid, function(err) {
          cb(err);
        });
      });
    } else {
      cb(err);
    }
  });
}

function writeJob(opts, next) {
  console.log('Writing job...');
  opts.writeFile(opts.jobFile, opts.generatedJob, {}, next);
}

function fakeMkdirp(path, opts, cb) {
  debug('fake mkdirp(%j, %j)', path, opts);
  setImmediate(cb);
}

function fakeWriteFile(path, data, opts, cb) {
  debug('fake fs.writeFile(%j, <data>, %j)', path, cb ? opts : {});
  setImmediate(cb);
}

function fakeChown(path, uid, gid, cb) {
  debug('fake fs.chown(%j, %j, %j)', path, uid, gid);
  setImmediate(cb);
}
