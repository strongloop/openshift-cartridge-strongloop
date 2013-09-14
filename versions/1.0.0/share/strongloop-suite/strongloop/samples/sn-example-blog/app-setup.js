// Setup for demo mode
//
// Populate MongoDB with user and blog posts

var User = require('./models/user')
  , Blog = require('./models/blog')
  , config = require('./config/config.js');


exports.run = function() {
  User.findOne({username: config.demo.user}, function(err, user) {
    if (err) {
      console.log(err);
    } else if (!user) {
      User.createUser(config.demo.user, config.demo.password);
    }
  });

  Blog.findOne({author: config.demo.user}, function(err, blog) {
    if (err) {
      console.log(err);
    } else if (!blog) {
      Blog.createBlogPost('Sample blog post', 'Content of the blog post', config.demo.user);
    }
  });

};
