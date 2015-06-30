'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs'),
  _ = require('lodash');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  Rideshare = mongoose.model('Rideshare'),
  createRideshare = require('./rideshare-create');

var logger,
  newUser = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString()),
  newRideshare1 = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString()),
  newRideshare1Updated;

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
      createUser(logger, mongoose, newUser)
        .then(function createUserSuccess(res) {
          should.exist(res._id);
          newRideshare1.user = res._id;
        })
        .then(done, done);
    });

    // Add a test rideshare
    beforeEach(function (done) {
      createRideshare(logger, mongoose, newRideshare1)
        .then(function createRideshareSuccess(res) {
          should.exist(res._id);
          res.user.should.equal(newRideshare1.user);

          newRideshare1Updated = {
            _id: res._id,
            itinerary: newRideshare1.itinerary
          };

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

      newRideshare1Updated.itinerary.type.should.equal('Wanted');
      newRideshare1Updated.itinerary.type = 'Offering';

      updateRideshare(logger, mongoose, newRideshare1Updated).then(function (res) {
        res.itinerary.type.should.equal('Offering');
      })
        .then(done, done);

    });

    it('should reject updated rideshare additional properties', function(done) {

      newRideshare1Updated.color = 'blue';

      updateRideshare(logger, mongoose, newRideshare1Updated).catch(function (err) {
        err.code.should.equal(400);
        err.message.should.equal('validation_error');
        err.data[0].message.should.equal('Additional properties not allowed: color');
      })
        .then(done, done);

    });

    it('should reject updated rideshare missing required properties', function(done) {

      delete newRideshare1Updated._id;

      updateRideshare(logger, mongoose, newRideshare1Updated).catch(function (err) {
        err.code.should.equal(400);
        err.message.should.equal('validation_error');
        err.data[0].message.should.equal('Missing required property: _id');
      })
        .then(done, done);

    });

    it('should handle database errors', function (done) {

      var stubFindByIdAndUpdate = function (id, rideshare, options, callback) {
        callback(new Error('Stubbed findByIdAndUpdate()'));
      };

      sinon.stub(Rideshare, 'findByIdAndUpdate', stubFindByIdAndUpdate);

      updateRideshare(logger, mongoose, newRideshare1Updated).catch(function (err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
