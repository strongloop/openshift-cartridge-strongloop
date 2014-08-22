var opts = require('minimist')(process.argv.slice(2));
var logger = require('..')(opts);

process.stdin.pipe(logger).pipe(process.stdout);
