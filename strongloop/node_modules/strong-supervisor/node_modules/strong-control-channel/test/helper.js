var fs = require('fs');
var net = require('net');

exports.unlink = function(name) {
  try {
    fs.unlinkSync(name);
  } catch (er) {
    // Don't care about errors
  }
};

exports.getUnusedPort = function(callback) {
  net.createServer().listen(0, function() {
    var port = this.address().port;
    this.close(function() {
      return callback(port);
    });
  });
};
