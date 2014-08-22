# strong-registry

CLI tool for working with multiple npm registry servers.

## Features

 - Manage named registry configurations (e.g. `private`, `staging`).
 - Switch your `npm` between different registries, taking care
   of per-registry settings like auth credentials or cache location.
 - Promote (re-publish) an already published package to another registry.

## Quick start

```
$ npm install -g strong-registry
$ sl-registry
```

## Documentation

See the official [StrongLoop command line interface documentation](http://docs.strongloop.com/display/SLC/slc+registry)
for detailed usage instructions.

## FAQ

#### How is this different than npmrc?

[npmrc](https://github.com/deoxxa/npmrc) switches complete npm configurations
by swapping your npmrc file.

strong-registry rewrites only the registry-related
configuration settings.

## Implementation overview

On the first run, a directory `$HOME/.strong-registry` is created to keep
the configuration files.

For each configuration, there is an ini file with the same name as the
configuration name (e.g. `default.ini`). The configuration file keeps
all registry-specific options.

When switching between registries, the npmrc file is modified and all
registry-specific options are replaced with the configured values.
