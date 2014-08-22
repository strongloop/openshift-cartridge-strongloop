var storage = require('../storage');
var RegistryConfig = require('../registry-config');
var spawnNpmLogin = require('../spawn-npm-login');

var NPM_RC_PATH = require('../').getUserNpmRc();

module.exports = function useRegistry($0, name) {
  if (!name) {
    console.error('Missing a required parameter: registry name.');
    process.exit(1);
  }

  var rc = new RegistryConfig(storage.loadOrExit(name));
  var npmrc = storage.tryReadIniFile(NPM_RC_PATH, {});

  updateCurrentRegistryFromNpmRc(npmrc);

  rc.applyTo(npmrc);
  storage.writeIniFile(NPM_RC_PATH, npmrc);

  console.log('Using the registry "%s" (%s).', name, rc.registry);

  if (new RegistryConfig(npmrc).requiresLogin()) {
    console.log('The registry requires authentication for all requests.');
    console.log('Running `npm login` to setup credentials.');
    spawnNpmLogin();
  }
};

function updateCurrentRegistryFromNpmRc(npmrc) {
  var currentRegistryUrl = npmrc.registry || RegistryConfig.getDefaultUrl();

  var current = RegistryConfig.findByUrl(currentRegistryUrl);
  if (!current) {
    console.log(
      'Discarding npmrc configuration of an unknown registry %s',
      currentRegistryUrl);
    return;
  }

  var old = new RegistryConfig(current.rc);
  current.rc.updateFrom(npmrc);

  if (wasUpdated(old, current.rc)) {
    console.log('Updating "%s" with config from npmrc.', current.name);
    storage.store(current.name, current.rc);
  }
}

function wasUpdated(old, current) {
  var diffs = Object.keys(old)
    .concat(Object.keys(current))
    .filter(function configPropertyWasUpdated(k) {
      return old[k] !== current[k];
    });

  return !!diffs.length;
}
