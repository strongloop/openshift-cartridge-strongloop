var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {dev: {mongodb: {}}}).dev.mongodb;

var ds = new DataSource(require('../'), config);

var Post = ds.define('Post', {
  title: { type: String, length: 255, index: true },
  content: { type: String }
});

var post = new Post({id: '123', title: 'a', content: 'AAA'});
console.log(post);