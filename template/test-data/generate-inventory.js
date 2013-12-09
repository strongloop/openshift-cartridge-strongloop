/*
 * This short script is only for generating data in a JSON file.
 *
 * Usage:
 *    node app.js # in the app dir
 *    node generate-inventory.js # in this dir
 */

var fs = require('fs');
var inventory = [];
var weaponTotal = {};
var request = require('request');

request('http://localhost:3000/weapons', {json: true}, function(err, res, weapons) {
  request('http://localhost:3000/locations', {json: true}, function(err, res, locations) {
    locations.forEach(function(loc) {
      weapons.forEach(function(weapon) {
        var availableAtLocation = rand(0, 100);

        inventory.push({
          productId: weapon.id,
          locationId: loc.id,
          available: rand(0, availableAtLocation),
          total: availableAtLocation
        });

      });
    });

    fs.writeFileSync('inventory.json', JSON.stringify(inventory, null, 2));
  });
});

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
