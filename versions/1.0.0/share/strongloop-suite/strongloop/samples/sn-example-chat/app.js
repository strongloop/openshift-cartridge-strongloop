require('strong-agent').profile();

if (require.main === module) {
  return run();
}

module.exports = run;

function run(defaultOptions) {
  var control = require('strong-cluster-control');
  var options = control.loadOptions(defaultOptions);
  var port = require('optimist').argv._[0]; // optional positional argument
  var role = options.clustered || 'simple';

  if (options.clustered) {
    // mq must be created in master and worker, because master brokers for the
    // workers
    var mq = require('strong-mq');
    var connection = mq.create({
      provider: 'native'
    });

    // cluster masters just start controller with loaded options
    if (options.isMaster) {
      console.log('Starting cluster controller');
      return control.start(options);
    }
  }

  if (options.isWorker) {
    // Clustered servers need more initialization, because they share state
    // through the master, or possibly through an external mq broker (not shown
    // here).
    var io = require('socket.io');
    var ClusterStore = require('strong-cluster-socket.io-store')(io);
    var WorkerServer = require('./lib/worker');
    var server = WorkerServer.createServer({
      port: port,
      mq: connection.open(),
      ioStore: new ClusterStore()
    });
  } else {
    // Simple servers need only a port.
    var SimpleServer = require('./lib/simple');
    var server = SimpleServer.createServer({
      port: port
    });
  }
  var logPrefix = role + ' ' + process.pid + ': ';

  server.start(function(err) {
    if (err) {
      console.error(logPrefix + 'Failed to start with:', err.message || err);
      process.exit(1);
    }

    console.log(logPrefix + 'Listening on port ' + server.port + '...');
  });
}
