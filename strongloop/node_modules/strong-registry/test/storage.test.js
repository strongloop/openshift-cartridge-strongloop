var storage = require('../lib/storage');
var sandbox = require('./helpers/sandbox');
var expect = require('must');
var debug = require('debug')('test');

describe('storage', function() {
  beforeEach(sandbox.reset);

  it('comes with a default entry', function() {
    givenInitializedStorage();
    var names = storage.listNames();
    expect(names).to.eql(['default']);
  });

  it('sets correct options for the default registry', function() {
    var expectedConfig = { registry: 'http://default/registry' };
    givenInitializedStorage(expectedConfig);
    var config = storage.load('default');
    expect(config).to.eql(expectedConfig);
  });
});

/*-- helpers --*/

function givenInitializedStorage(defaultConfig) {
  var factory = function() {
    return defaultConfig || { registry: 'https://default/registry' };
  };

  storage.init(sandbox.resolve('data'), factory, debug);
}
