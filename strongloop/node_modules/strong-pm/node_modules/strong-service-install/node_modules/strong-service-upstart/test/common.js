var fs = require('fs');

module.exports = {
  fixture: readFixture
}

function readFixture(name) {
  var path = require.resolve('./fixtures/' + name);
  return fs.readFileSync(path, 'utf8');
}
