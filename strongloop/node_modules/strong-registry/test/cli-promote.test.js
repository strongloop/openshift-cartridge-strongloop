var Promise = require('bluebird');
var fs = require('fs-extra');
var expect = require('must');
var sandbox = require('./helpers/sandbox');
var CliRunner = require('./helpers/cli-runner');
var itOnUnix = require('./helpers/it-on-unix');
var startRegistryServer = require('./helpers/registry-server');
var givenPackage = require('./helpers/given-package');
var execNpm = require('../lib/exec-npm');

var pkg;

describe('`sl-registry promote`', function() {
  beforeEach(sandbox.reset);
  beforeEach(sandbox.givenInitializedStorageWithDefaultEntry);
  beforeEach(givenTwoRegistryServers);
  afterEach(stopRegistryServers);

  beforeEach(function() {
    pkg = givenPackage();
  });

  it('downloads and uploads the promoted package', function() {
    return publishToSourceRegistry()
      .then(promoteFromSourceToDestination)
      .then(installFromDestinationRegistry)
      .then(expectPackageWasInstalled);
  });

  itOnUnix('reports error when no package spec is provided', function() {
    return new CliRunner('promote', { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Missing a required parameter: package name@version.')
      .run();
  });

  itOnUnix('reports error when package spec is missing version', function() {
    return new CliRunner('promote a-name', { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Invalid package specifier "a-name": missing the version.')
      .run();
  });

  itOnUnix('reports error when package version is not valid', function() {
    return new CliRunner('promote a-name@invalid', { stream: 'stderr' })
      .expectExitCode(1)
      .expect('The version string "invalid" is not a valid semver.')
      .run();
  });

  itOnUnix('reports error when from and to is the same registry', function() {
    var args = 'promote --from src --to src pkg@1.0.0';
    return new CliRunner(args, { stream: 'stderr' })
      .expectExitCode(1)
      .expect('The "from" and "to" registries must be different.')
      .run();
  });

  itOnUnix('reports error when registry config does not exist', function() {
    var args = 'promote --from unknown pkg@1.0.0';
    return new CliRunner(args, { stream: 'stderr' })
      .expectExitCode(1)
      .expect('Unknown registry: "unknown"')
      .run();
  });

  itOnUnix('fails when the package does not exist', function() {
    var args = 'promote --from src --to dest unknown@1.0.0';
    return new CliRunner(args, { stream: 'stderr' })
      .expectExitCode(2)
      .expect('Command failed: npm http GET http://localhost')
      .run();
  });

  itOnUnix('fails when the package was already published', function() {
    return publishToSourceRegistry()
      .then(publishToDestinationRegistry)
      .then(function() {
        var args = 'promote --from src --to dest ' + pkg.nameAtVersion;
        return new CliRunner(args, { stream: 'stderr' })
          .expectExitCode(2)
          .expect('Command failed: npm http PUT http://localhost')
          .run();
      });
  });

  it('runs `npm login` when "from" registry requires auth', function() {
    return publishToSourceRegistry()
      .then(function() {
        sandbox.updateEntry('src', function(config) {
          clearAuthCredentials(config);
          config['always-auth'] = true;
        });

        var args = 'promote --from src --to dest ' + pkg.nameAtVersion;
        return new CliRunner(args)
          .expect('The registry "src" requires authentication for all requests')
          .expect('Running `npm login` to setup credentials.')
          .expect('Username:')
          .sendLine('admin')
          .expect('Password:')
          .sendLine('pass')
          .expect('Email:')
          .sendLine()
          .sendEof() // prevent `npm login` from waiting for more input
          .expect('Downloading')
          .run();
      });
  });

  it('runs `npm login` when "to" registry is missing credentials', function() {
    return publishToSourceRegistry()
      .then(function() {
        sandbox.updateEntry('dest', clearAuthCredentials);
        var args = 'promote --from src --to dest ' + pkg.nameAtVersion;
        return new CliRunner(args)
          .expect('Credentials are required to publish to the registry "dest".')
          .expect('Running `npm login` to set them up.')
          .expect('Username:')
          .sendLine('admin')
          .expect('Password:')
          .sendLine('pass')
          .expect('Email:')
          .sendLine()
          .sendEof() // prevent `npm login` from waiting for more input
          .expect('Downloading')
          .expect('Publishing')
          .run();
      });
  });

  it('uses current registry as default for --from', function() {
    return publishToSourceRegistry()
      .then(useSourceRegistry)
      .then(function() {
        var args = ['promote', '--to', 'dest', pkg.nameAtVersion];

        return new CliRunner(args)
          .expect(
            'Downloading ' + pkg.nameAtVersion + ' from src (http://')
          .expect(
            'Publishing ' + pkg.nameAtVersion + ' to dest (http://')
          .run();
      });
  });

  it('uses current registry as default for --to', function() {
    return publishToSourceRegistry()
      .then(useTargetRegistry())
      .then(function() {
        var args = ['promote', '--from', 'src', pkg.nameAtVersion];

        return new CliRunner(args)
          .expect(
            'Downloading ' + pkg.nameAtVersion + ' from src (http://')
          .expect(
            'Publishing ' + pkg.nameAtVersion + ' to dest (http://')
          .run();
      });
  });

  it('uses correct default value for cache path', function() {
    // The default registry does not have `cache` option set
    // which means to use the default npm cache $HOME/.npm.
    // To keep the test simple, we will emulate this scenario
    // by removing the cache option from a non-default entry

    return publishToSourceRegistry()
      .then(function() {
        sandbox.updateEntry('src', function(config) {
          delete config.cache;
        });
      })
      .then(useSourceRegistry)
      .then(function() {
        var args = ['promote', '--to', 'dest', pkg.nameAtVersion];

        return new CliRunner(args)
          .expect('Downloading')
          .expect('Publishing')
          .expectExitCode(0)
          .run();
      });
  });

  it('uses values from the master npmrc when appropriate', function() {
    // when one of --from/--to registries is currently in use,
    // promote should use $HOME/.npmrc instead of the ini file
    // in order to use the current configuration options that
    // might not be synced to the .ini file yet.
    sandbox.updateEntry('src', function(config) {
      config['always-auth'] = true;
    });

    return publishToSourceRegistry()
      .then(useSourceRegistry)
      .then(function() {
        // keep auth credentials in $HOME/.npmrc, but remove them from src.ini
        sandbox.updateEntry('src', clearAuthCredentials);
      })
      .then(promoteFromSourceToDestination);
  });
});

function clearAuthCredentials(config) {
  delete config.username;
  delete config._password;
  delete config._auth;
}

function publishToSourceRegistry() {
  return publishToNamedRegistry('src');
}

function publishToDestinationRegistry() {
  return publishToNamedRegistry('dest');
}

function publishToNamedRegistry(name) {
  var rc = sandbox.getIniPathForName(name);
  if (!fs.existsSync(rc)) {
    return Promise.reject(
      new Error('publish: unknown registry "' + name + '"'));
  }

  return execNpm(['publish', '--userconfig', rc], { cwd: pkg.dir })
    .then(function() {
      // remove the published tarball from the cache
      fs.removeSync(sandbox.getCachePathForName(name));
    });
}

function useSourceRegistry() {
  return useNamedRegistry('src');
}

function useTargetRegistry() {
  return useNamedRegistry('dest');
}

function useNamedRegistry(name) {
  return new CliRunner(['use', name]).run();
}

function promoteFromSourceToDestination() {
  var args = [
    'promote',
    '--from', 'src',
    '--to', 'dest',
    pkg.nameAtVersion
  ];

  return new CliRunner(args)
    .expect(
      'Downloading ' + pkg.nameAtVersion + ' from src (http://')
    .expect(
      'Publishing ' + pkg.nameAtVersion + ' to dest (http://')
    .run();
}

function installFromDestinationRegistry() {
  // create sandbox/node_modules to prevent npm from installing
  // to the top-level project directory
  fs.mkdirsSync(sandbox.resolve('node_modules'));

  // run "npm install"
  var destRc = sandbox.getIniPathForName('dest');
  return execNpm(
    ['install', '--userconfig', destRc, pkg.nameAtVersion],
    { cwd: sandbox.PATH }
  );
}

function expectPackageWasInstalled() {
  var index = sandbox.resolve('node_modules', pkg.name, 'index.js');
  expect(fs.existsSync(index), 'index.js was created').to.be.true();
}

var srcServer, destServer;
function givenTwoRegistryServers() {
  return setupRegistry('src')
    .then(function(server) {
      srcServer = server;
      return setupRegistry('dest');
    })
    .then(function(server) {
      destServer = server;
    });
}

function setupRegistry(name) {
  return startRegistryServer(name)
    .then(function(server) {
      var port = server.address().port;
      var url = 'http://localhost:' + port;
      sandbox.givenAdditionalEntry(name, {
        registry: url,
        email: 'test@example.com',
        _auth: 'YWRtaW46cGFzcw==' // admin:pass
      });
      server.name = name;
      server.url = url;
      return server;
    });
}

function stopRegistryServers() {
  return srcServer.closeAsync()
    .then(function() {
      destServer.closeAsync();
    });
}
