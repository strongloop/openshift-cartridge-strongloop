/**
 * Dependencies
 */

var loopback = require('loopback');
var config = require('../config');

// Use the memory connector by default.
var DB = (process.env.DB = process.env.DB || 'memory');

// Load the environmental settings for this database.
config = config[config.env][DB];

if (!config) {
  config = {};
}

console.log('Using the %s connector.', DB);
console.log('To specify another connector:');
console.log('  DB=oracle node app');
console.log('  DB=mongodb node app');

switch (DB) {
  case 'oracle':
  case 'mongodb':
  case 'mysql':
    var m = 'loopback-connector-' + DB;
    try {
      config.connector = require(m);
    } catch (e) {
      console.log('could not require %s', m);
      console.log('make sure it is listed in package.json');
      console.log('then run');
      console.log('  npm install');

      throw e;
    }
  break;
  default:
    config.connector = loopback.Memory;
  break;
}

try {
  module.exports = loopback.createDataSource(config);
} catch (e) {
  console.error('Error while initializing the data source:');
  console.error(e.stack);
  console.error('\nPlease check your configuration settings and try again.');
  process.exit(1);
}

if (DB === 'memory') {
  // import data
  require('../test-data/import');
}
