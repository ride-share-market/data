'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  User = mongoose.model('User'),
  userAddProvider = require('./user-provider-update'),
  newUserGoogleFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json')),
  newUserFacebookFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-facebook.json'));

var logger,
  existingUser;

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('User', function () {

  describe('Update Provider', function () {

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

    // Add a user with a google oauth provider
    beforeEach(function (done) {

      createUser(logger, mongoose, newUserGoogleFixture).then(function (res) {
        should.exist(res._id);
        newUserGoogleFixture._id = res._id;
        existingUser = res;
        done();
      }, console.error);

    });

    afterEach(function (done) {
      if (User.findByIdAndUpdate.restore) {
        User.findByIdAndUpdate.restore();
      }
      done();
    });

    it('should update an existing users provider details', function (done) {
      should.exist(userAddProvider);

      existingUser.currentProvider.should.equal('google');
      should.exist(existingUser.providers.google);
      should.not.exist(existingUser.providers.facebook);

      userAddProvider(logger, mongoose, existingUser, newUserFacebookFixture)
      .then(function(res) {
          res.currentProvider.should.equal('facebook');
          should.exist(res.providers.google);
          should.exist(res.providers.facebook);
        })
      .catch(function(err) {
          console.log(err);
        })
      .then(done, done);

    });

    it('should handle errors', function (done) {

      var stubFindByIdAndUpdate = function (id, user, options, callback) {
        callback(new Error('Stubbed findByIdAndUpdate()'));
      };

      sinon.stub(User, 'findByIdAndUpdate', stubFindByIdAndUpdate);

      userAddProvider(logger, mongoose, existingUser, newUserFacebookFixture).catch(function (err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
