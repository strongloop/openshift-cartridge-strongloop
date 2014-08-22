var helper = require('./helper');
var server = require('../server');

function nop() {
  // no-op
}

var addr = 'a-pipe';

helper.unlink(addr);
server.create(nop).listen(addr).unref();

// If server is unrefed, it should not keep node from exiting
