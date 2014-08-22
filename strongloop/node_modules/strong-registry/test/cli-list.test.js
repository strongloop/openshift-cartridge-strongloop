var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');
var itOnUnix = require('./helpers/it-on-unix');

describe('`sl-registry list`', function() {
  beforeEach(sandbox.reset);
  beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);

  it('lists available configurations', function() {
    return new CliRunner(['list'])
      .expect('Available configurations:')
      .expect(' * default (https://registry.npmjs.org/)')
      .expect(
      'Run `sl-registry.js use <name>` to switch to a different registry'
    )
      .run();
  });

  it('uses env.SLC_COMMAND as $0', function() {
    return new CliRunner(['list'], { env: { SLC_COMMAND: 'TEST-CMD' }})
      .run()
      .then(function(stdout) {
        expect(stdout.pop()).to.match(/Run `slc TEST-CMD -h`/);
        expect(stdout.pop()).to.match(/Run `slc TEST-CMD use <name>`/);
      });
  });

  it('flags the active configuration', function() {
    sandbox.givenAdditionalEntry(
      'another',
      { registry: 'http://another/registry'}
    );
    return new CliRunner(['list'])
      .waitForAvailableConfigurations()
      .expect('   another (http://another/registry)')
      .expect(' * default (https://registry.npmjs.org/)')
      .run();
  });
});
