var Promise = require('bluebird');
var sandbox = require('./sandbox');
var sinopia = require('sinopia/lib/index');

module.exports = exports = startRegistryServer;

/**
 * Start a new instance of a registry server.
 *
 * The server has a single hard-coded user with credentials 'admin:pass'
 *
 * @param name
 * @returns {Promise} A promise resolved with server's port number
 */
function startRegistryServer(name) {
  return new Promise(function(resolve, reject) {
    var config = getConfig(name);

    // workaround for a bug in Sinopia API
    require('sinopia/lib/logger').setup(config.logs);

    var app = sinopia(config);

    app.listen()
      .on('listening', function() {
        Promise.promisifyAll(this.constructor.prototype);
        resolve(this);
      })
      .on('error', function(err) {
        reject(err);
      });
  });
}

function getConfig(name) {
  return {
    storage: sandbox.resolve('private-packages-' + name),
    users: {
      admin: {
        // value: 'pass'
        password: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684'
      }
    },
    uplinks: {},
    packages: {
      '*': {
        'allow_access': 'all',
        'allow_publish': 'all'
      }
    },
    logs: [{ type: 'stderr', format: 'pretty', level: 'debug' }]
  };
}
