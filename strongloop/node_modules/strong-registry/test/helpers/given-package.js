var fs = require('fs-extra');
var path = require('path');
var extend = require('util')._extend;
var sandbox = require('./sandbox');

var packageCounter = 0;

module.exports = function givenPackage(packageJson) {
  var defaults = {
    'name': 'test-package-' + (++packageCounter),
    'version': '1.0.0',
    'description': 'a test package',
    'main': 'index.js',
    'author': 'me',
    'license': 'BSD'
  };
  packageJson = extend(defaults, packageJson);
  var pkgDir = sandbox.resolve(packageJson.name);

  fs.removeSync(pkgDir);
  fs.mkdirsSync(pkgDir);

  var jsonFile = path.join(pkgDir, 'package.json');
  fs.writeJsonFileSync(jsonFile, {
    name: packageJson.name,
    version: '1.0.0'
  });

  var indexFile = path.join(pkgDir, 'index.js');
  fs.writeFileSync(indexFile, '// empty');

  return {
    dir: pkgDir,
    name: packageJson.name,
    version: packageJson.version,
    nameAtVersion: packageJson.name + '@' + packageJson.version
  };
};
