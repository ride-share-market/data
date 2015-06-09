'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  createRideshare = require('./rideshare-create'),
  findAllRideshares = require('./rideshare-find-all'),
  Rideshare = mongoose.model('Rideshare');

var logger,
  user = {
    email: 'user@rideshare-find-all.com',
    provider: 'google',
    profile: {
      name: 'Find All Rideshares'
    }
  },
  rideshare1 = {
    user: null,
    itinerary: {
      from: 'Here',
      to: 'There'
    }
  },
  rideshare2 = {
    user: null,
    itinerary: {
      from: 'Home',
      to: 'Work'
    }
  };

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

  describe('Find All', function () {

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

    afterEach(function (done) {
      if (Rideshare.find.restore) {
        Rideshare.find.restore();
      }
      done();
    });

    describe('Results', function () {

      // Add a test user
      beforeEach(function (done) {

        createUser(logger, mongoose, user)
          .then(function createUserSuccess(res) {
            should.exist(res._id);
            rideshare1.user = res._id;
            rideshare2.user = res._id;
            done();
          }, console.error);

      });

      // Add a test rideshares
      beforeEach(function (done) {

        createRideshare(logger, mongoose, rideshare1)
          .then(function createRideshareSuccess(res) {
            should.exist(res._id);
            res.user.should.equal(rideshare1.user);
            rideshare1._id = res._id;
            return createRideshare(logger, mongoose, rideshare2);
          })
          .then(function createRideshareSuccess(res) {
            should.exist(res._id);
            res.user.should.equal(rideshare2.user);
            rideshare2._id = res._id;
          })
          .then(done, done);

      });

      it('should return a ASC sorted array of Rideshares', function (done) {

        findAllRideshares(logger, mongoose)
          .then(function findRideshareAllSuccess(res) {
            res.should.be.instanceof(Array);
            res.length.should.equal(2);
            // test the first rideshare in the array is the 2nd rideshare created - ie. sorted newest to oldest
            res[0].itinerary.from.should.equal('Home');
          })
          .then(done, done);

      });

    });

    describe('No Results', function () {

      it('should return no results found', function(done) {

        findAllRideshares(logger, mongoose)
          .catch(function findAllRidesharesError(err) {
            err.code.should.equal(404);
            err.message.should.equal('not_found');
            err.data.should.equal('No Rideshares found.');
          })
          .then(done, done);

      });

      it('should handle unexpected errors', function (done) {

        var stubFind = function () {
          return {
            populate: function() {
              return {
                exec: function(callback) {
                  callback(new Error('Stubbed find()'));
                }
              };
            }
          };
        };

        sinon.stub(Rideshare, 'find', stubFind);

        findAllRideshares(logger, mongoose)
          .catch(function findAllRidesharesError(err) {
            err.code.should.equal(500);
            err.message.should.equal('internal_server_error');
            err.data.should.equal('Internal Server Error.');
          })
          .then(done, done);

      });

    });

  });

});
