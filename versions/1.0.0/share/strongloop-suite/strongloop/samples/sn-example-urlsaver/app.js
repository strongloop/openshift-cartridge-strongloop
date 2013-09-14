require('strong-agent').profile();

var control = require('strong-cluster-control');
var options = control.loadOptions();

if (options.clustered && options.isMaster) {
  return control.start(options);
}

var port = require('optimist').argv._[0]; // optional positional argument
var server = require('./lib/server').createServer({
  port: port
});

// Disable Q's long stack traces for performance.
require('q').longStackJumpLimit = 0;

server.start(function(err) {
  if (err) {
    console.error('Failed to start with:', err.message || err);
    process.exit(1);
  }

  console.log('Listening on port ' + server.port + '...');
});
