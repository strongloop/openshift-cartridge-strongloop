/**
 * REST API Tests
 */

function json(verb, url) {
  return request(app)[verb](url)
  .set('Content-Type', 'application/json')
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/);
}

describe('REST', function() {
  /**
   * Expected Input Tests
   */

  describe('Expected Usage', function() {

    describe('GET /weapons', function() {
      it('should return a list of all weapons', function(done) {
        json('get', '/weapons')
          .expect(200)
          .end(function(err, res) {
            assert(Array.isArray(res.body));
            assert.equal(res.body.length, testData.weapons.length);

            done();
          });
      });
    });

    describe('POST /weapons', function() {
      it('should create a new weapon', function(done) {
        json('post', '/weapons')
          .send({
            'title': 'M1911-2',
            'audibleRange': 52.8,
            'effectiveRange': 50,
            'rounds': 7,
            'fireModes': 'Single'
          })
          .expect(200)
          .end(function(err, res) {
            assert(typeof res.body === 'object');
            assert(res.body.id, 'must have an id');
            done();
          });
      });
    });

    describe('PUT /weapons/:id', function() {
      it('should update a weapon with the given id', function(done) {
        json('get', '/weapons')
          .expect(200, function(err, res) {
            var weapons = res.body;
            var weapon = weapons[0];

            json('put', '/weapons/' + weapon.id)
              .send({
                audibleRange: 999,
                effectiveRange: weapon.effectiveRange,
                rounds: weapon.rounds,
                fireModes: weapon.fireModes
              })
              .expect(200, function(err, res) {
                var updatedWeapon = res.body;
                assert(updatedWeapon);
                assert(updatedWeapon.id);
                assert.equal(updatedWeapon.id, weapon.id);
                assert.equal(updatedWeapon.audibleRange, 999);
                json('get', '/weapons/' + weapon.id)
                  .expect(200, function(err, res) {
                    var foundWeapon = res.body;
                    assert.equal(foundWeapon.id, weapon.id);
                    assert.equal(foundWeapon.audibleRange, 999);
                    assert.equal(foundWeapon.effectiveRange, weapon.effectiveRange);
                    assert.equal(foundWeapon.rounds, weapon.rounds);
                    assert.equal(foundWeapon.fireModes, weapon.fireModes);
                    done();
                  });
              });
          });
      });
    });

    describe('GET /locations', function() {
      it('should return a list of locations', function(done) {
        json('get', '/locations')
          .expect(200, function(err, res) {
            var locations = res.body;
            assert(Array.isArray(locations));
            assert.equal(locations.length, testData.locations.length);
            done();
          });
      });
    });

    describe('GET /locations/nearby', function() {
      it('should return a list of locations near given point', function(done) {
        json('get', '/locations/nearby?here[lat]=37.587409&here[lng]=-122.338225')
          .expect(200, function(err, res) {
            var locations = res.body;
            assert(Array.isArray(locations));
            assert.equal(locations[0].name, 'Bay Area Firearms');
            assert.equal(locations.length, testData.locations.length);
            locations.forEach(function(l) {
              assert(l.geo);
              assert.equal(typeof l.geo.lat, 'number');
              assert.equal(typeof l.geo.lng, 'number');
            });
            assert.equal(locations[locations.length - 1].city, 'Amsterdam');
            done();
          });
      });
    });

    describe('GET /locations/:id/inventory', function() {
      it('should return a list of inventory for the given location id', function(done) {
        json('get', '/locations/5/inventory')
          .expect(200, function(err, res) {
            var inventory = res.body;
            assert.equal(inventory.length, 87);
            inventory.forEach(function(inv) {
              assert.equal(typeof inv.total, 'number');
              assert.equal(typeof inv.available, 'number');
            });
            done();
          });
      });
    });

    // describe('GET /customers', function(){
    //   it('should return a 401 when not logged in as an admin', function(done) {
    //     json('get', '/customers').expect(401, done);
    //   });
    //
    //   it('should return all users when logged in as an admin', function(done) {
    //
    //   });
    // });

  });

  // describe('Unexpected Usage', function(){
  //   describe('POST /weapons/:id', function(){
  //     it('should not crash the server when posting a bad id', function(done) {
  //       json('post', '/weapons/foobar').send({}).expect(404, done);
  //     });
  //   });
  // });

});
