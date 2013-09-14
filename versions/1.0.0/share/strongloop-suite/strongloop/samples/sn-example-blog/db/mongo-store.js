/**
 * A module to connect to a MongoDB store
 */
var mongoose = require('mongoose'),
    config = require('../config/config.js');

exports.mongoose = mongoose;
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('MongoDB connection opened');
});

// bootstrap mongoose connection
var mongo = config.creds.mongo;

var generateMongoUrl = function(obj) {
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'sample-blog_development');
  if (obj.username && obj.password) {
    return 'mongodb://' + obj.username + ':' + obj.password + '@' + obj.hostname + ':' + obj.port + '/' + obj.db;
  } else {
    return 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.db;
  }
};

var mongourl = process.env.MONGODB_URI || generateMongoUrl(mongo);

if (mongoose.connection.readyState === 0) {
  exports.db = mongoose.connect(mongourl);
}

exports.mongourl = mongourl;
