'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoose = mongodb.mongoose,
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  userSignIn = require('./user-sign-in'),
  createUser = require('./user-create'),
  User = mongoose.model('User'),
  newUserGoogleFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json')),
  newUserFacebookFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-facebook.json'));

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

var logger;

describe('User', function () {

  describe('Sign In', function () {

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

    describe('New User', function () {

      afterEach(function (done) {
        if (User.prototype.save.restore) {
          User.prototype.save.restore();
        }
        done();
      });

      it('should reject a non valid user JSON schema', function (done) {

        userSignIn(logger, mongoose, {})
          .catch(function (err) {
            err.code.should.equal(400);
            should.exist(err.message.jsonSchemaErrors);
          })
          .then(done, done);

      });

      it('should sign in a brand new user', function (done) {

        userSignIn(logger, mongoose, newUserGoogleFixture).then(function userSignInSuccess(res) {
          res.email.should.equal(newUserGoogleFixture.email);
          should.exist(res._id);
        })
          .then(done, done);

      });

      it('should handle internal user create errors', function (done) {

        var stubSave = function (callback) {
          callback(new Error('Stubbed user.save()'));
        };

        sinon.stub(User.prototype, 'save', stubSave);

        userSignIn(logger, mongoose, newUserGoogleFixture).catch(function userSignInError(err) {
          err.code.should.equal(500);
          err.message.should.equal('internal_server_error');
          err.data.should.equal('Internal Server Error.');
        })
          .then(done, done);

      });

    });

    describe('Existing User', function () {

      var existingUser;

      // Create an existing user
      beforeEach(function (done) {

        createUser(logger, mongoose, newUserGoogleFixture)
          .then(function createUserSuccess(res) {
            should.exist(res._id);
            existingUser = res;
            done();
          }, console.error);

      });

      it('should sign in an existing new user', function (done) {

        userSignIn(logger, mongoose, newUserGoogleFixture).then(function (res) {
          res.email.should.equal(newUserGoogleFixture.email);
          res._id.toString().should.equal(existingUser._id.toString());
        })
          .then(done, done);

      });

      it('should sign in an existing new user with a new provider', function (done) {

        userSignIn(logger, mongoose, newUserFacebookFixture).then(function (res) {
          res.email.should.equal(newUserGoogleFixture.email);
          res.currentProvider.should.equal('facebook');
          res._id.toString().should.equal(existingUser.id.toString());
        })
          .then(done, done);

      });

    });

  });

});
