var http = require('http');
var cicada = require('../');

var ci = cicada('/tmp/blarg');
ci.on('commit', function (commit) {
    commit.run('test').on('exit', function (code) {
        var status = code === 0 ? 'PASSED' : 'FAILED';
        console.log(commit.hash + ' ' + status);
    });
});

var server = http.createServer(ci.handle);
server.listen(5255);
