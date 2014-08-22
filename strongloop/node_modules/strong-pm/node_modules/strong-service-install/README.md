# strong-service-install

Create/install system service for a given app.

Currently only supports Upstart, via
[strong-service-upstart](https://github.com/strongloop/strong-service-upstart).

## Installation

`npm install strong-service-install`

## Usage

```js
var installer = require('strong-service-install');

var opts = {
  name: 'my-app',
  author: require('package.json').author,
  user: process.env.USER,
  command: 'my-app --with args --that work',
  cwd: process.env.HOME,
};

installer(opts, function(err, result) {
  if (err) {
    console.error('Failed to install "my-app" service:', err.message);
    process.exit(1);
  } else {
    console.log('Successfully installed "my-app" service:', result);
    process.exit(0);
  }
});
```

### CLI

There is a minimal CLI that exposes the API options as arguments:
```
usage: sl-svc-install [options] -- <app and args>

Options:
  -h,--help        Print this message and exit.
  --name           Name to use for service (default derived from app)
  --user           User to run service as.
  --group          Group to run service as.
  --jobFile        Upstart file to create (default /etc/init/<name>.conf)
  --cwd            Directory to run the service from.
  --version        Version of Upstart to assume: 0.6 or 1.4 (default)
```
