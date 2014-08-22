var loopback = require('..');
var request = require('supertest');
var app = loopback();

var db = loopback.createDataSource({ connector: 'memory' });

loopback.User.attachTo(db);
app.model(loopback.User);
loopback.AccessToken.attachTo(db);
loopback.User.hasMany(loopback.AccessToken);


app.enableAuth();
app.use(loopback.token());
app.use(loopback.rest());

var credentials = { email: 'foo@foo.com', password: 'password'};
loopback.User.create(credentials, function(err) {
  if (err) throw err;
  loopback.User.login(credentials, function(err, token) {
    if (err) throw err;
    console.log('passed');
    process.exit();
  });
});
