#!/usr/bin/env node

var path = require('path');
var osenv = require('osenv');
var registry = require('../');

var DATA_DIR = path.join(osenv.home(), '.strong-registry');
var $0 = process.env.SLC_COMMAND ?
  'slc ' + process.env.SLC_COMMAND :
  path.basename(process.argv[1]);

initialize();
executeCommand();

/*-- implementation --*/

function initialize() {
  try {
    registry.init(DATA_DIR, registry.createDefaultConfig, console.log);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function executeCommand() {
  var commandName = process.argv[2] || 'list';

  if (['--version', '-v'].indexOf(commandName) != -1) {
    console.log(require('../package.json').version);
    return;
  }

  if (['--help', '-h'].indexOf(commandName) != -1) {
    registry.printHelp($0, console.log);
    return;
  }

  var commandFn = registry.commands[commandName];
  if (!commandFn) {
    console.error('Unknown command: %s', commandName);
    process.exit(1);
  }

  // Collapse ["node", "sl-registry.js", "command-name", ...] to [$0, ...]
  var args = [$0].concat(process.argv.slice(3));
  commandFn.apply(null, args);
}
