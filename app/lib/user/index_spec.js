'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoose = mongodb.mongoose,
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  user = require('./.');

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

var logger;

describe('User', function () {

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

  describe('Find By Email', function () {

    it('should reject non valid email format', function (done) {

      user.findByEmail(logger, mongoose, {email: 'ab'}).catch(function (err) {
        should.exist(err);
        err.code.should.equal(400);
        err.message.should.equal('validation_error');
        err.data[0].path.should.equal('email');
        err.data[0].message.should.equal('String is too short (2 chars), minimum 3');
      })
        .then(done, done);

    });

    it('should return user search results', function (done) {

      user.findByEmail(logger, mongoose, {email: 'unkown@user.com'}).catch(function findByEmailError(err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Account profile not found.');
      })
        .then(done, done);

    });

  });

  describe('Find By ID', function () {

    it('should reject non valid user ID format', function (done) {

      user.findById(logger, mongoose, {id: 'abc123'}).catch(function (err) {
        err.code.should.equal(400);
        err.message.should.equal('validation_error');
        err.data[0].path.should.equal('id');
        err.data[0].message.should.equal('String is too short (6 chars), minimum 24');
      })
        .then(done, done);

    });

    it('should return user search results', function (done) {

      user.findById(logger, mongoose, {id: '542ecc5738cd267f52ac2085'}).catch(function findByIdError(err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Account profile not found.');
      })
        .then(done, done);

    });

  });

});
