/**
 * Configuration for the sample blog application
 */
// mongodb connection
exports.creds = {
  mongo: {
    'hostname': 'localhost',
    'port': 27017,
    'username': '',
    'password': '',
    'name': '',
    'db': 'sample-blog_development'
  }
};

// CORS allowed domains
exports.cors = {
  allowedDomains: '*',
  allowedHeaders: '*',
  allowedMethods: '*'
};

exports.auth = {
  enabled: process.argv.indexOf('--noAuth') == -1
};

exports.demo = {
  enabled: process.argv.indexOf('--noSetup') == -1,
  user: 'strongloop',
  password: 'password'
};

