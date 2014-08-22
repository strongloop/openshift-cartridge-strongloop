var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');
var itOnUnix = require('./helpers/it-on-unix');


describe('`sl-registry add`', function() {
  beforeEach(sandbox.reset);
  beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);

  itOnUnix('reports error when no name is provided', function() {
    return new CliRunner(['add'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Missing a required parameter: registry name.')
      .run();
  });

  it('reads options and creates a new entry', function() {
    return new CliRunner(['add', 'custom', 'http://custom/registry'])
      .expect('Adding a new configuration "custom"')

      .waitFor('Registry URL: (http://custom/registry)')
      .sendLine('') // use the provided default

      .waitFor('HTTP proxy:').sendLine('http://proxy')
      .waitFor('HTTPS proxy:').sendLine('https://secure-proxy')
      .waitFor('Email:').sendLine('user@example.com')
      .waitFor('Always authenticate? (Y/n)').sendLine('')

      .waitFor('Check validity of server SSL certificates? (Y/n)')
      .sendLine('')

      .waitFor('Configuration "custom" was created.')
      .expect('Run `sl-registry.js use "custom"` to let' /* etc. */)
      .run()
      .then(function() {
        var config = sandbox.load('custom');
        expect(config).to.eql({
          registry: 'http://custom/registry',
          proxy: 'http://proxy',
          'https-proxy': 'https://secure-proxy',
          email: 'user@example.com',
          cache: sandbox.getCachePathForName('custom'),
          'always-auth': true,
          'strict-ssl': true,
        });
      });
  });

  it('offers default values from ~/.npmrc', function() {
    sandbox.givenUserNpmRc({
      proxy: 'npmrc-proxy',
      'https-proxy': 'npmrc-https-proxy',
      username: 'npmrc-username',
      email: 'npmrc-email',
    });

    return new CliRunner(['add', 'custom', 'http://registry'])
      .waitFor('Registry URL:').sendLine('')
      .waitFor('HTTP proxy: (npmrc-proxy)').sendLine('')
      .waitFor('HTTPS proxy: (npmrc-https-proxy)').sendLine('')
      .waitFor('Email: (npmrc-email').sendLine('')
      .run();
  });

  it('deletes keys with empty value', function() {
    // empty value means use default
    // this is achieved by omitting the option from the ini file
    return new CliRunner(['add', 'custom', 'http://registry'])
      .waitFor('Registry URL:').sendLine()
      .waitFor('HTTP proxy:').sendLine()
      .waitFor('HTTPS proxy:').sendLine()
      .waitFor('Email:').sendLine()
      .waitFor('Always auth').sendLine()
      .waitFor('Check validity').sendLine()
      .run()
      .then(function() {
        var config = sandbox.load('custom');
        expect(config).to.eql({
          registry: 'http://registry',
          cache: sandbox.getCachePathForName('custom'),
          'always-auth': true,
          'strict-ssl': true
        });
      });
  });

  it('sets unique cache path', function() {
    return new CliRunner(['add', 'custom', 'http://registry'])
      .waitFor('Registry URL:').sendLine()
      .waitFor('HTTP proxy:').sendLine()
      .waitFor('HTTPS proxy:').sendLine()
      .waitFor('Email:').sendLine()
      .waitFor('Always auth').sendLine()
      .waitFor('Check validity').sendLine()
      .run()
      .then(function() {
        var npmrc = sandbox.load('custom');
        expect(npmrc.cache).to.equal(sandbox.getCachePathForName('custom'));
      });
  });
});
