var spawn = require('child_process').spawn;

module.exports = function (cmd, opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    var ps = spawn(cmd[0], cmd.slice(1), opts);
    var data = '';
    ps.stdout.on('data', function (buf) { data += buf });
    ps.stderr.on('data', function (buf) { data += buf });
    
    var pending = 3;
    var code;
    
    function onend () {
        if (--pending !== 0) return;
        if (code !== 0) {
            cb(
                'non-zero exit code ' + code
                + ' in command: ' + cmd.join(' ') + '\n'
                + data
            );
        }
        else cb()
    }
    ps.stdout.on('end', onend);
    ps.stderr.on('end', onend);
    ps.on('exit', function (c) { code = c; onend() });
    ps.on('error', cb);
}
