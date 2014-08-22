var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var parseShell = require('shell-quote').parse;

module.exports = function (opts) {
    return new Commit(opts);
};

function Commit (opts) {
    this.id = opts.id;
    this.dir = opts.dir;
    this.repo = opts.repo;
    this.hash = opts.hash;
    this.branch = opts.branch;
}

inherits(Commit, EventEmitter);

Commit.prototype.spawn = function (cmd, args, opts) {
    if (typeof cmd === 'string' && !Array.isArray(args)) {
        opts = args;
        args = parseShell(String(cmd));
        cmd = args.shift();
    }
    if (Array.isArray(cmd)) {
        opts = args;
        args = cmd.slice(1);
        cmd = cmd[0];
    }
    
    if (!opts) opts = {};
    if (!opts.cwd) opts.cwd = this.dir;
    
    return spawn(cmd, args, opts);
};

Commit.prototype.run = function (scriptName, opts) {
    if (!opts) opts = {};
    return this.spawn([ 'npm', 'run-script' ].concat(scriptName), opts);
};
