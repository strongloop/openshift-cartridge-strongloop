/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./ammo.json');

/**
 * Ammo Model
 */

var Ammo = module.exports = db.createModel(
  'ammo',
  config.properties,
  config.options
);
