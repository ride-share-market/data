'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  Rideshare = mongoose.model('Rideshare'),
  createRideshare = require('./rideshare-create'),
  deleteRideshare = require('./rideshare-remove');

var logger,
  user = {
    email: 'user@rideshare-create.com',
    provider: 'google',
    profile: {
      name: 'Create Rideshare',
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

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

  describe('Delete', function () {

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
      if (Rideshare.remove.restore) {
        Rideshare.remove.restore();
      }
      done();
    });

    describe('Valid RPC Input', function () {

      it('should remove a Rideshare', function (done) {

        deleteRideshare(logger, mongoose, {id: rideshare._id})
          .then(function deleteRideshareSuccess(res) {
            res._id.should.eql(rideshare._id);
          })
          .then(done, done);

      });

      it('should return 404 for unknown Rideshare', function (done) {

        deleteRideshare(logger, mongoose, {id: '546b76317c5ae961209cd544'}).catch(function deleteRideshareError(err) {
            // test logging was done
            sinon.assert.calledOnce(logger.error);

            err.code.should.equal(404);
            err.message.should.equal('not_found');
            err.data.should.equal('Rideshare not found.');
          })
          .then(done, done);

      });

      it('should handle unexpected remove errors', function (done) {

        var stubFindByIdAndRemove = function (id, options, callback) {
          callback(new Error('Stubbed remove()'));
        };

        sinon.stub(Rideshare, 'findByIdAndRemove', stubFindByIdAndRemove);

        deleteRideshare(logger, mongoose, {id: rideshare._id})
          .catch(function deleteRideshareError(err) {

            // test logging was done
            sinon.assert.calledOnce(logger.error);

            err.code.should.equal(500);
            err.message.should.equal('internal_server_error');
            err.data.should.equal('Internal Server Error.');
          })
          .then(done, done);

      });

    });

    describe('Invalid RPC Input', function () {

      it('should reject invalid RPC input', function (done) {

        deleteRideshare(logger, mongoose, {id: 'abc123'})
          .catch(function deleteRideshareError(err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].path.should.equal('id');
            err.data[0].message.should.equal('String is too short (6 chars), minimum 24');
          })
          .then(done, done);

      });

    });

  });

});
