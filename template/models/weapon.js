/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./weapon.json');

/**
 * product Model
 */

var Weapon = module.exports = db.createModel(
  'weapon',
  config.properties,
  config.options
);
