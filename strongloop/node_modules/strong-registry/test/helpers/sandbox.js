var path = require('path');
var fs = require('fs-extra');
var storage = require('../..').storage;
var RegistryConfig = require('../..').RegistryConfig;

var sandbox = module.exports;

sandbox.HOME =
sandbox.PATH = path.resolve(__dirname, '..', 'sandbox');

sandbox.reset = function() {
  fs.removeSync(sandbox.PATH);
  fs.mkdirsSync(sandbox.PATH);
};

sandbox.resolve = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(sandbox.PATH);
  return path.resolve.apply(path, args);
};

// mix-in all storage methods
for (var key in storage) {
  sandbox[key] = storage[key];
}

/**
 * Initialize the storage class to use the path in sandbox as DATA_DIR.
 * Create a default registry entry based on the test npm userconfig,
 * which is empty by default.
 */
sandbox.givenInitializedStorageWithDefaultEntry = function() {
  storage.init(
    path.join(sandbox.HOME, '.strong-registry'),
    function createDefaultConfig() {
      return RegistryConfig.createDefault(sandbox.getUserNpmRc());
    },
    function() { /* discard initialization messages */}
  );
};

/**
 * Create an additional registry config entry.
 * @param {String} name
 * @param {Object=} config
 */
sandbox.givenAdditionalEntry = function(name, config) {
  config = config || { registry: 'http://additional/registry' };
  config.cache = config.cache || storage.getCachePathForName(name);
  storage.store(name, config);
};

/**
 * Update the named registry config entry.
 * @param {string} name
 * @param {function(config)} updateFn
 */
sandbox.updateEntry = function(name, updateFn) {
  var config = storage.load(name);
  updateFn(config);
  storage.store(name, config);
};

/**
 * Get path of the npm userconfig ($HOME/.npmrc).
 * @returns {string}
 */
sandbox.getUserNpmRc = function() {
  return path.resolve(sandbox.HOME, '.npmrc');
};

/**
 * Create a npm userconfig file with the given configuration.
 * @param {Object} config
 */
sandbox.givenUserNpmRc = function(config) {
  storage.writeIniFile(sandbox.getUserNpmRc(), config);
};

/**
 * Read the npm userconfig file.
 * @returns {Object}
 */
sandbox.readUserNpmRrc = function() {
  return storage.readIniFile(sandbox.getUserNpmRc());
};
