'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  findUserById = require('./user-find-by-id');

var logger,
  user = {
    email: 'user@find-by-id.com',
    provider: 'google',
    profile: {
      name: 'Net Citizen'
    }
  };

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('User', function () {

  describe('Find By ID', function () {

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

    // Add test users
    beforeEach(function (done) {

      createUser(logger, mongoose, user)
        .then(function createUserSuccess(res) {
          should.exist(res._id);
          user._id = res._id;
          done();
        }, console.error);

    });

    it('should find a user by ID', function (done) {

      findUserById(logger, mongoose, user._id.toString()).then(function findUserByIdSuccess(res) {
        res.should.be.instanceof(Array);
        res[0]._id.should.eql(user._id);
      })
      .then(done, done);

    });

    it('should return 404 Not Found', function (done) {

      findUserById(logger, mongoose, '3449e25a19c8f08214e37dd7').catch(function findUserByIdError(err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Account profile not found.');
      })
        .then(done, done);

    });

    it('should handle database errors', function(done) {

      findUserById(logger, mongoose, 'abc123').catch(function findUserByIdError(err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
