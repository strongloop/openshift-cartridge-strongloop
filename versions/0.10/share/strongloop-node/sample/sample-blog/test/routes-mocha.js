process.env.NODE_ENV = 'test';
require('should');
var app = require('../app.js'), 
    request = require('supertest'), 
    mongoose = require('mongoose'), 
    _u = require('underscore');
    assert = require('assert');

var json = JSON.stringify;

before(function onBefore(done) {
    var connection = mongoose.connection;
    connection.on('open', function () {
        connection.db.dropCollection('blogs', function (err, result) {
            assert.equal(null, err);
            console.log('dropped collection: blogs');
            done();
        });
    });

});

describe('rest', function () {
    describe('GET /rest/blogs', function () {
        it('should return empty list', function (done) {
            console.log('Sending request to GET /rest/blogs');
            request(app).get('/rest/blogs')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        console.log('ERROR', arguments);

                    res.should.have.property('body');
                    res.body.should.be.an.instanceOf(Array);
                    res.body.should.have.length(0);

                    done();
                });
        });

    });
    var id;
    describe('POST /rest/blogs', function () {
        it('should create a new blogs and return it', function (done) {
            request(app)
                .post('/rest/blogs')
                .set('Content-Type', 'application/json')
                .send(json({
                author: 'superblogger',
                title:'Test Blog 1',
                body:'Some blogged goodness'
            })).expect(200).end(function (err, res) {
                    if (err)
                        console.log('ERROR', arguments);

                    res.should.have.property('body');
                    res.body.should.have.property('author', 'superblogger');
                    res.body.should.have.property('title', 'Test Blog 1');
                    res.body.should.have.property('body', 'Some blogged goodness');
                    id = res.body._id;
                    done();

                });

        });
    });

    describe('testing  /rest/blogs', function () {
        var cid;
        it('should add 2 comments to the blog post', function (done) {

            request(app)
                .put('/rest/blogs/' + id)
                .set('Content-Type', 'application/json')
                .send(json({
                comments:[
                    {author: 'anonymous', title:'Very Cool Thing You Have', body:'Do you like my body?'},
                    {author: 'usera', title:'I dunno I\'m bored', body:'if you think i\'m sexy'}
                ]
            })).end(function (err, res) {
                    if (err)
                        console.log('ERROR', arguments);
                    res.should.be.json
                    res.should.have.status(200);
                    res.should.have.property('body');
                    res.body.should.have.property('comments');
                    res.body.comments.should.have.lengthOf(2);
                    cid = res.body.comments[1]._id;
                    done();

                });

        });
    });
    describe('DELETE /rest/blogs/$id', function () {
        it('should delete the created blog posting', function (done) {
            request(app).del('/rest/blogs/' + id).end(function (err, res) {
                res.should.have.status(200);
                done();
            });
        });

        it('should be null because it was deleted', function (done) {
            request(app).get('/rest/blogs/' + id).end(function (err, res) {
                res.should.have.status(200);
                console.log(res.body);
                done();
            });
        });

    });
    describe('GET /rest/blogs with search options', function () {
        var pids = [];
        it('sets up post A for testing', function (done) {
            createPost({author: 'usera', title:'Post A', body:'A'}, function (e) {
                pids.push(e._id);
                done();
            });
        });
        it('sets up post B for testing', function (done) {
            createPost({author: 'userb', title:'Post B', body:'B'}, function (e) {
                pids.push(e._id);
                done();
            });
        });
        it('sets up post C for testing', function (done) {
            createPost({author: 'userc', title:'Post C', body:'C'}, function (e) {
                pids.push(e._id);
                done();
            });
        });
        it('sets up post C for testing with date', function (done) {
            createPost({author: 'userc', title:'Post C', date:new Date(150000000000)}, function (e) {
                pids.push(e._id);
                done();
            });
        });

        it('should be able to skip and limit', function (done) {
            request(app).get('/rest/blogs?skip=1&limit=1').end(function (err, res) {
                res.should.be.json
                res.should.have.status(200);
                res.should.have.property('body');
                console.log(res.body);
                res.body[0].should.have.property('_id', pids[1]);
                done();
            });
        });

        describe('should handle errors without crashing when calling an invalid id', function () {
            it('should not crash', function (done) {
                request(app).get('/rest/blogs/junk').end(function (err, res) {
                    res.should.have.status(404);
                    done();
                });
            })
            it('should not crash', function (done) {
                request(app).get('/rest/blogs/').end(function (err, res) {
                    res.should.have.status(200);

                    done();
                });
            })
        })

    });
    var t = 0;

    function createPost(opts, cb) {
        if (!cb) {
            cb = opts;
            opts = { author: 'annoymous', title:'Test ' + (t), body:'default body for ' + t}
            t++;
        }

        request(app)
            .post('/rest/blogs')
            .set('Content-Type', 'application/json')
            .send(json(_u.extend({ created_at:new Date() }, opts))).end(
            function (err, res) {
                cb(res.body);
            });
    }

});
