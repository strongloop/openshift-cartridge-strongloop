var fs = require('fs-extra');
var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');
var itOnUnix = require('./helpers/it-on-unix');

describe('`sl-registry remove`', function() {
  beforeEach(sandbox.reset);
  beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);

  itOnUnix('reports error when configuration does not exist', function() {
    return new CliRunner(['remove', 'unknown'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Unknown registry: "unknown"')
      .run();
  });

  itOnUnix('reports error when no name is provided', function() {
    return new CliRunner(['remove'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Missing a required parameter: registry name.')
      .run();
  });

  itOnUnix('reports error when name is "default"', function() {
    return new CliRunner(['remove', 'default'], { stream: 'stderr' })
      .expectExitCode(1)
      .expect('The default registry cannot be removed.')
      .run();
  });

  it('removes config file and cache file', function() {
    sandbox.givenAdditionalEntry('custom');
    var cachePath = sandbox.getCachePathForName('custom');
    fs.mkdirsSync(cachePath);

    return new CliRunner(['remove', 'custom'])
      .expect('The registry "custom" was removed.')
      .run()
      .then(function() {
        var iniPath = sandbox.getIniPathForName('custom');
        expect(fs.existsSync(iniPath), 'ini exists').to.be.false();
        expect(fs.existsSync(cachePath), 'cache exists').to.be.false();
      });
  });
});
