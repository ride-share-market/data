'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  _ = require('lodash');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  User = mongoose.model('User'),
  userCreate = require('./user-create');

// Connect to database if not already connected from other tests
if(mongoose.connection.readyState === 0) {
  mongodb.connect();
}

var logger,
  newUser = {
  email: 'user@create.com',
  provider: 'google',
  profile: {
    name: 'User Create',
    gender: 'male'
  }
};

describe('User', function () {

  describe('Create', function () {

    // Before each test make sure the database readyState is 1 (connected)
    beforeEach(function (done) {
      mongoDbTestUtils.waitForConnection(mongoose, done);
    });

    // Before each test nuke the test database, recreate it, rebuild all the indexes
    beforeEach(function (done) {
      mongoDbTestUtils.resetDatabase(mongoose, done);
    });

    // Set up the test logger
    beforeEach(function(done) {
      logger = {
        error: sinon.spy()
      };
      done();
    });

    afterEach(function (done) {
      if (User.prototype.save.restore) {
        User.prototype.save.restore();
      }
      done();
    });

    it('should handle unexpected save errors', function (done) {

      should.exist(userCreate);

      var stubSave = function (callback) {
        callback(new Error('Stubbed user.save()'));
      };

      sinon.stub(User.prototype, 'save', stubSave);

      userCreate(logger, mongoose, newUser)
        .then(console.error, function createError(err) {

          // test logging was done
          sinon.assert.calledOnce(logger.error);

          err.code.should.equal(500);
          err.message.should.equal('internal_server_error');
          err.data.should.equal('Internal Server Error.');
        })
        .then(done, done);

    });

    it('should save a new user', function (done) {

      // Create a unique value for this test, a check value, asserting this value in the return will ensure we have the correct same user
      var thisUser = _.clone(newUser, true);
      thisUser.profile.name = [Date.now().toString(), Math.random()].join('-');

      userCreate(logger, mongoose, thisUser)
        .then(function userCreateSuccess(res) {
          should.exist(res._id);
          res.providers.google.name.should.equal(thisUser.profile.name);
        }, console.error)
        .then(done, done);

    });

    it('should reject duplicate email addresses', function (done) {

      // Create user
      userCreate(logger, mongoose, newUser)
        .then(function userCreateSuccess() {

          // Create same user again
          return userCreate(logger, mongoose, newUser);
        })
        .then(console.error, function(err) {

          // test logging was done
          sinon.assert.calledOnce(logger.error);

          err.code.should.equal(409);
          err.message.should.equal('email_conflict');
          err.data.should.equal('This email account already exists.');
        })
        .then(done, done);

    });

  });


});
