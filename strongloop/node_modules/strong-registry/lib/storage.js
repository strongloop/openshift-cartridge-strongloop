var assert = require('assert');
var path = require('path');
var fs = require('fs');
var ini = require('ini');
var osenv = require('osenv');
var debug = require('debug')('strong-registry:storage');

var storage = exports;

var DATA_DIR;

/**
 * Initialize the storage of registry configurations
 * @param {string} dataDir Location where to keep all configuration files
 * @param {function(): Object} defaultConfigFn Factory function for settings
 * of the default registry
 * @param {function(...Object)} log Logger function
 */
storage.init = function(dataDir, defaultConfigFn, log) {
  DATA_DIR = dataDir;
  log = log || function() {};

  if (fs.existsSync(DATA_DIR)) return;

  log('Running for the first time.');
  try {
    fs.mkdirSync(DATA_DIR);
  } catch (err) {
    var msg = 'Cannot create ' + JSON.stringify(DATA_DIR) + ': ' + err.message;
    throw new Error(msg);
  }
  log('Created %s', DATA_DIR);

  var config = defaultConfigFn();
  assert(config.registry, 'default config must have "registry" property');
  storage.store('default', config);
  log('Added "default" registry (%s)\n', config.registry);
};

/**
 * List names of configurations
 * @returns {Array.<string>}
 */
storage.listNames = function() {
  var EXT = /\.ini$/;

  return fs.readdirSync(DATA_DIR)
    .filter(function(fileName) { return EXT.test(fileName); })
    .map(function(fileName) { return fileName.replace(EXT, ''); });
};

/**
 * Create or update a named configuration.
 * @param {string} name
 * @param {Object} config
 */
storage.store = function(name, config) {
  var file = storage.getIniPathForName(name);
  storage.writeIniFile(file, config);
};

/**
 * Load a named configuration, throw on error.
 * @param {string} name
 * @returns {Object}
 */
storage.load = function(name) {
  var file = storage.getIniPathForName(name);
  return storage.readIniFile(file);
};

/**
 * Load a named configuration.
 * When the configuration cannot be loaded, an error is reported
 * and the process exits.
 * @param {String} name
 * @returns {Object}
 */
storage.loadOrExit = function(name) {
  try {
    return storage.load(name);
  } catch(err) {
    if (err.code == 'ENOENT') {
      console.error('Unknown registry: "%s"', name);
    } else {
      console.error('Cannot load registry "%s": %s', name, err.message);
    }
    process.exit(1);
  }
};

/**
 * Resolve a path relative to data directory.
 * @param {...string} varArgs
 * @returns {string}
 */
storage.resolvePath = function(varArgs) {
  var args = [DATA_DIR].concat(Array.prototype.slice.call(arguments));
  return path.resolve.apply(path, args);
};

/**
 * Read and parse an ini file.
 * @param {string} file
 * @returns {Object}
 */
storage.readIniFile = function(file) {
  var content = fs.readFileSync(file, 'utf-8');
  debug('loaded %s %s', file, content);
  return ini.parse(content);
};

/**
 * Try to read and parse an ini file
 * @param {string} file
 * @param {boolean} fallbackValue Value to return when the file does not exist.
 */
storage.tryReadIniFile = function(file, fallbackValue) {
  if (!fs.existsSync(file)) return fallbackValue;
  return storage.readIniFile(file);
};

/**
 * Write the object to an ini file.
 * @param {string} file
 * @param {Object} data
 */
storage.writeIniFile = function(file, data) {
  var content = ini.stringify(data);
  debug('stored %s %s', file, content);
  fs.writeFileSync(file, content, 'utf-8');
};

/**
 * Get the path of the configuration ini file for the given registry name.
 * @param {string} name
 * @returns {string}
 */
storage.getIniPathForName = function(name) {
  return storage.resolvePath(name + '.ini');
};

/**
 * Get the path of npm cache directory for the given registry name.
 * @param {string} name
 * @returns {string}
 */
storage.getCachePathForName = function(name) {
  return storage.resolvePath(name + '.cache');
};
