var path = require('path');
var fs = require('fs-extra');
var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');

describe('`sl-registry`', function() {
  beforeEach(sandbox.reset);

  describe('on the first run', function() {
    it('prints info message', function() {
      return new CliRunner()
        .expect('Running for the first time')
        .run();
    });

    it('creates $HOME/.strong-registry', function() {
      return new CliRunner()
        .run()
        .then(function(stdout) {
          var dir = path.resolve(CliRunner.HOME, '.strong-registry');
          expect(fs.existsSync(dir), dir + ' exists').to.be.true();
        });
    });
  });

  describe('with no command', function() {
    beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);
    it('lists available configurations', function() {
      return new CliRunner()
        .expect('Available configurations:')
        .run();
    });
  });
});
