'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  createRideshare = require('./rideshare-create'),
  findRideshareByUserId = require('./rideshare-find-by-user-id');

var logger,
  newUser = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString()),
  newRideshare1 = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString()),
  newUserId,
  newRideshare1Id;

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

  // Before each test make sure the database readyState is 1 (connected)
  beforeEach(function (done) {
    mongoDbTestUtils.waitForConnection(mongoose, done);
  });

  // Before each test nuke the test database, recreate it, rebuild all the indexes
  beforeEach(function (done) {
    mongoDbTestUtils.resetDatabase(mongoose, done);
  });

  // Set up the test logger
  beforeEach(function (done) {
    logger = {
      error: sinon.spy()
    };
    done();
  });

  // Add test user
  beforeEach(function (done) {
    createUser(logger, mongoose, newUser).then(function (res) {
      should.exist(res._id);
      newUserId = res._id;
      newRideshare1.user = res._id;
    }).
      then(done, done);
  });

  // Add a test rideshares
  beforeEach(function (done) {
    createRideshare(logger, mongoose, newRideshare1).then(function (res) {
      should.exist(res._id);
      newRideshare1Id = res._id;
      res.user.should.equal(newUserId);
    })
      .then(done, done);

  });

  describe('Find By User ID', function () {

    it('should find a by ID', function (done) {

      findRideshareByUserId(logger, mongoose, newUserId.toString()).then(function (res) {
        res.should.be.instanceof(Array);
        res[0]._id.should.eql(newRideshare1Id);
      })
        .then(done, done);

    });

    it('should return 404 Not Found', function (done) {

      findRideshareByUserId(logger, mongoose, '3449e25a19c8f08214e37dd7').catch(function (err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Rideshare not found.');
      })
        .then(done, done);

    });

    it('should handle database errors', function (done) {

      findRideshareByUserId(logger, mongoose, 'abc123').catch(function (err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
