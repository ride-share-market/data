'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  Rideshare = mongoose.model('Rideshare'),
  createRideshare = require('./rideshare-create');

var logger,
  user = {
    email: 'user@rideshare-update.com',
    provider: 'google',
    profile: {
      name: 'Update Rideshare',
      gender: 'male'
    }
  },
  rideshare = {
    user: null,
    itinerary: {
      from: 'Here',
      to: 'There'
    }
  };

var updateRideshare = require('./rideshare-update');

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

  describe('Update', function () {

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

    // Add a test user
    beforeEach(function (done) {

      createUser(logger, mongoose, user)
        .then(function createUserSuccess(res) {
          should.exist(res._id);
          rideshare.user = res._id;
          done();
        }, console.error);

    });

    // Add a test rideshare
    beforeEach(function (done) {

      createRideshare(logger, mongoose, rideshare)
        .then(function createRideshareSuccess(res) {
          should.exist(res._id);
          res.user.should.equal(rideshare.user);
          rideshare._id = res._id;
        })
        .then(done, done);

    });

    afterEach(function (done) {
      if (Rideshare.findByIdAndUpdate.restore) {
        Rideshare.findByIdAndUpdate.restore();
      }
      done();
    });

    it('should update a rideshare', function (done) {

      rideshare.itinerary.to.should.equal('There');
      rideshare.itinerary.to = 'Work';

      updateRideshare(logger, mongoose, rideshare).then(function updateRideshareSuccess(res) {
        res._id.should.eql(rideshare._id);
        res.itinerary.to.should.equal('Work');
      })
        .then(done, done);

    });

    it('should handle errors', function (done) {

      var stubFindByIdAndUpdate = function (id, rideshare, options, callback) {
        callback(new Error('Stubbed findByIdAndUpdate()'));
      };

      sinon.stub(Rideshare, 'findByIdAndUpdate', stubFindByIdAndUpdate);

      updateRideshare(logger, mongoose, rideshare).catch(function updateRideshareError(err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
