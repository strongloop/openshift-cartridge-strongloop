/**
 * App Dependencies.
 */

var loopback = require('loopback')
  , app = module.exports = loopback()
  , fs = require('fs')
  , path = require('path')
  , request = require('request')
  , TaskEmitter = require('strong-task-emitter');

// expose a rest api
app.use(loopback.rest());

// Add static files
app.use(loopback.static(path.join(__dirname, 'public')));

// require models
fs
  .readdirSync(path.join(__dirname, './models'))
  .filter(function (m) {
    return path.extname(m) === '.js';
  })
  .forEach(function (m) {
    // expose model over rest
    app.model(require('./models/' + m));
  });
  
// enable docs
app.docs({basePath: 'http://localhost:3000'});

// start the server
app.listen(3000);
