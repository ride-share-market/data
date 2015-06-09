'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  createRideshare = require('./rideshare-create'),
  findRideshareById = require('./rideshare-find-by-id');

var logger,
  user = {
    email: 'user@rideshare-find-by-id.com',
    provider: 'google',
    profile: {
      name: 'Net Citizen',
      url: 'https://plus.google.com/103434308786179622443',
      image: {
        url: 'https://lh3.googleusercontent.com/-XdUIqdMkCWC/AAAAAAAAAAI/AAAAAAAAAAA/6252fscbu5M/photo.jpg?sz=50'
      }
    }
  },
  rideshare = {
    user: null,
    itinerary: {
      from: 'Here',
      to: 'There'
    }
  };

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

    createUser(logger, mongoose, user)
      .then(function createUserSuccess(res) {
        should.exist(res._id);
        user._id = res._id;
        rideshare.user = res._id;
        done();
      }, console.error);

  });

  // Add a test rideshares
  beforeEach(function (done) {

    createRideshare(logger, mongoose, rideshare)
      .then(function createRideshareSuccess(res) {
        should.exist(res._id);
        res.user.should.equal(rideshare.user);
        rideshare._id = res._id;
      })
      .then(done, done);

  });

  describe('Find By ID', function () {


    it('should find by ID', function (done) {

      findRideshareById(logger, mongoose, rideshare._id.toString()).then(function findRideshareByIdSuccess(res) {
        res.should.be.instanceof(Array);
        res[0]._id.should.equal(rideshare._id.toString());
      })
        .then(done, done);

    });

    it('should return 404 Not Found', function (done) {

      findRideshareById(logger, mongoose, '3449e25a19c8f08214e37dd7').catch(function findRideshareByIdError(err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Rideshare not found.');
      })
        .then(done, done);

    });

    it('should handle database errors', function(done) {

      findRideshareById(logger, mongoose, 'abc123').catch(function findRideshareByIddError(err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
