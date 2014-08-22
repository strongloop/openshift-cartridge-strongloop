var storage = require('../storage');
var fs = require('fs');
var rimraf = require('rimraf');

module.exports = function removeRegistry($0, name) {
  if (!name) {
    console.error('Missing a required parameter: registry name.');
    process.exit(1);
  }

  if (name == 'default') {
    console.error('The default registry cannot be removed.');
    process.exit(1);
  }

  var iniFile = storage.getIniPathForName(name);
  if (!fs.existsSync(iniFile)) {
    console.error('Unknown registry: "%s"', name);
    process.exit(1);
  }

  fs.unlinkSync(iniFile);

  var cacheDir = storage.getCachePathForName(name);
  rimraf(cacheDir, function(err) {
    if (err)
      console.error('Warning: cannot remove cache dir - %s', err.message);

    console.log('The registry "%s" was removed.', name);
  });
};
