var http = require('http');
var cicada = require('../');
var test = require('tap').test;
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');

var basedir = '/tmp/cicada-dirmapped-test/'
    + Math.random().toString(16).slice(2);
mkdirp.sync(basedir + '/abcdefg');

var ci;
var server = http.createServer(function (req, res) {
    ci.handle(req, res);
});

test('setup', function (t) {
    server.listen(0, t.end.bind(t));
});

test('dir-mapped push', function (t) {
    t.plan(8 + 2 + 6);
    
    ci = cicada({
        repodir : function (repo) {
            // 8 of these should fire
            t.equal(repo, 'beep.git');
            return basedir + '/repo-abcdefg';
        },
        workdir : function (commit) {
            // 1 of these should fire
            t.equal(commit.repo, 'beep.git');
            t.equal(commit.cwd, basedir + '/repo-abcdefg');
            return basedir + '/abcdefg';
        }
    });
    
    ci.on('commit', function (commit) {
        t.equal(commit.repo, 'beep.git');
        t.equal(commit.dir, basedir + '/abcdefg');
        
        (function () {
            var ps = commit.spawn('ls');
            var data = '';
            ps.stdout.on('data', function (buf) { data += buf });
            ps.on('close', function (code) {
                t.equal(code, 0);
                t.equal(data, 'robot.txt\n');
            });
        })();
        
        (function () {
            var ps = commit.spawn('pwd');
            var data = '';
            ps.stdout.on('data', function (buf) { data += buf });
            ps.on('close', function (code) {
                t.equal(code, 0);
                t.equal(data, commit.dir + '\n');
            });
        })();
    });
    
    spawn(__dirname + '/push.sh', [
        'http://localhost:' + server.address().port + '/beep.git'
    ]);
});

test('teardown', function (t) {
    server.close();
    t.end();
});
