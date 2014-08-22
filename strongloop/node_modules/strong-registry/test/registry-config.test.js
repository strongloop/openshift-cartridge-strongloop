var RegistryConfig = require('../lib/registry-config');
var sandbox = require('./helpers/sandbox');
var expect = require('must');
var fs = require('fs-extra');
var ini = require('ini');
var debug = require('debug')('test');

var NPM_RC_PATH = sandbox.resolve('npmrc');

describe('RegistryConfig', function() {
  beforeEach(sandbox.reset);

  describe('createDefault', function() {
    it('points to npmjs.org by default', function() {
      var reg = RegistryConfig.createDefault(NPM_RC_PATH);

      var expected = new RegistryConfig({
        registry: 'https://registry.npmjs.org/'
      });
      expect(reg).to.eql(expected);
    });

    it('reads configuration from npmrc', function() {
      var npmrc = {
        registry: 'https://private/registry',
        username: 'a-user-name',
        email: 'an-email',
        proxy: 'http://proxy',
        'https-proxy': 'https://secure-proxy',
        'local-address': 'local.address',
        'strict-ssl': true,
        'always-auth': true
      };
      givenNpmRc(npmrc);

      var reg = RegistryConfig.createDefault(NPM_RC_PATH);

      expect(reg).to.eql(new RegistryConfig(npmrc));
    });
  });

  describe('constructor', function() {
    it('removes untracked config properties', function() {
      var reg = new RegistryConfig({ unicode: false });
      expect(reg).to.not.have.property('unicode');
    });
  });
});

/*-- helpers --*/

function givenNpmRc(config) {
  var content = ini.stringify(config || {});
  fs.writeFileSync(NPM_RC_PATH, content, 'utf-8');
}

