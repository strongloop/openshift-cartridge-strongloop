/**
 * Run `node import.js` to import the test data into the db.
 */

var db = require('../data-sources/db');
var weapons = require('./weapons.json');
var customers = require('./customers.json');
var inventory = require('./inventory.json');
var locations = require('./locations.json');
var loopback = require('loopback');
var app = loopback();
var Weapon = require('../models/weapon');
var Inventory = require('../models/inventory');
var Location = require('../models/location');
var TaskEmitter = require('strong-task-emitter');

var i = 1;

var importer = module.exports = new TaskEmitter();

db.autoupdate(function () {
  Location.destroyAll(function (err) {
    if(err) {
      console.error('Could not destroy locations.');
      throw err;
    }
    
    Weapon.destroyAll(function (err) {
      if(err) {
        console.error('Could not destroy weapons (PRODUCT).');
        throw err;
      }
      
      weapons.forEach(function (obj) {
        obj.name = obj.title;
        delete obj.title;
        delete obj.slot;
        delete obj.source;
        delete obj.damage;
        delete obj.rawDamage;
        obj.id = ++i;
          
        if(Array.isArray(obj.audibleRange)) obj.audibleRange = obj.audibleRange[0];
        if(Array.isArray(obj.rounds)) obj.rounds = obj.rounds[0];
        if(Array.isArray(obj.fireModes)) obj.fireModes = JSON.stringify(obj.fireModes);
        if(Array.isArray(obj.extras)) obj.extras = JSON.stringify(obj.extras);
        if(Array.isArray(obj.magazines)) obj.magazines = JSON.stringify(obj.magazines);
        
        importer.task(Weapon, 'create', obj);
      });
      
      locations.forEach(function (loc) {
        loc.id = i++;
        importer.task(Location, 'create', loc);
      });
    });
    
    Inventory.destroyAll(function (err) {
      if(err) {
        console.error('Could not destroy inventory.');
        throw err;
      }
      
      inventory.forEach(function (inv) {
        inv.id = i++;
        importer.task(Inventory, 'create', inv);
      });
    });
    
    
    var Customer = require('../models/customer');
    
    Customer.destroyAll(function (err) {
      if(err) {
        console.error('Could not destroy customers.');
        throw err;
      }
      
      customers.forEach(function (obj) {
        obj.id = ++i;
        
        importer.task(Customer, 'create', obj);
      });
    });
   
  });
});
