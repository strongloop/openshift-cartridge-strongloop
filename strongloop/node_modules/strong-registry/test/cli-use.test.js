var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');
var itOnUnix = require('./helpers/it-on-unix');

describe('`sl-registry use`', function() {
  beforeEach(sandbox.reset);
  beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);

  itOnUnix('reports error when configuration does not exist', function() {
    return new CliRunner(['use', 'unknown'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Unknown registry: "unknown"')
      .run();
  });

  itOnUnix('reports error when no name is provided', function() {
    return new CliRunner(['use'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Missing a required parameter: registry name.')
      .run();
  });

  it('updates ~/.npmrc', function() {
    sandbox.givenAdditionalEntry(
      'custom',
      { registry: 'http://private/registry' }
    );
    return new CliRunner(['use', 'custom'])
      .expect('Using the registry "custom" (http://private/registry).')
      .run()
      .then(function() {
        var npmrc = sandbox.readUserNpmRrc();
        expect(npmrc.registry).to.equal('http://private/registry');
      });
  });

  it('deletes entries not defined in registry config', function() {
    sandbox.givenAdditionalEntry('custom');
    sandbox.givenUserNpmRc({ proxy: 'http://proxy' });
    return new CliRunner(['use', 'custom'])
      .run()
      .then(function() {
        var npmrc = sandbox.readUserNpmRrc();
        expect(npmrc.proxy).to.be.undefined();
      });
  });

  it('preserves entries not related to registry config', function() {
    sandbox.givenAdditionalEntry('custom');
    sandbox.givenUserNpmRc({ browser: 'firefox' });
    return new CliRunner(['use', 'custom'])
      .run()
      .then(function() {
        var npmrc = sandbox.readUserNpmRrc();
        expect(npmrc.browser).to.equal('firefox');
      });
  });

  it('updates registry config from ~/.npmrc', function() {
    sandbox.givenAdditionalEntry('custom');
    sandbox.givenUserNpmRc({ _auth: 'user:name' });
    return new CliRunner(['use', 'custom'])
      .expect('Updating "default" with config from npmrc.')
      .run()
      .then(function() {
        var rc = sandbox.load('default');
        expect(rc._auth).to.equal('user:name');
      });
  });

  it('warns when ~/.npmrc contains unknown registry', function() {
    sandbox.givenAdditionalEntry('custom');
    sandbox.givenUserNpmRc({ registry: 'http://unknown-registry' });
    return new CliRunner(['use', 'custom'])
      .expect('Discarding npmrc configuration of an unknown registry ' +
        'http://unknown-registry')
      .run();
  });

  it('runs `npm login` when always-auth is enabled', function () {
    sandbox.givenAdditionalEntry('custom', { 'always-auth': true });
    return new CliRunner(['use', 'custom'])
      .expect('Using the registry "custom"')
      .expect('The registry requires authentication for all requests.')
      .expect('Running `npm login` to setup credentials.')
      .expect('Username:')
      .run();
  });

});
