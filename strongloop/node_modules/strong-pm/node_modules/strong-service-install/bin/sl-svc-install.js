#!/usr/bin/env node

var minimist = require('minimist');
var install = require('../');

var opts = minimist(process.argv.slice(2));

if (!opts.command) {
  if (opts._.length > 0)
    opts.command = opts._;
  delete opts._;
}

if (opts.help || opts.h)
  return usage(process.argv[1], console.log.bind(console));

install(opts, function(err, result) {
  if (err) {
    console.error(err.stack);
    process.exit(1);
  }
});

function usage($0, p) {
  p('usage: %s [options] -- <app and args>', $0);
  p('');
  p('Options:');
  p('  -h,--help        Print this message and exit.');
  p('  --name           Name to use for service (default derived from app)')
  p('  --user           User to run service as.');
  p('  --group          Group to run service as.');
  p('  --jobFile        Upstart file to create (default /etc/init/<name>.conf)');
  p('  --cwd            Directory to run the service from.');
  p('  --version        Version of Upstart to assume: 0.6 or 1.4 (default)');
}
