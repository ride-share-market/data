'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  User = mongoose.model('User'),
  findUserByEmail = require('./user-find-by-email');

var logger,
  user = {
    email: 'user@find-by-email.com',
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

  describe('Find By Email', function () {

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

    afterEach(function (done) {
      if (User.find.restore) {
        User.find.restore();
      }
      done();
    });

    it('should find a user by email', function (done) {

      findUserByEmail(logger, mongoose, user.email).then(function findUserByEmailSuccess(res) {
        res.should.be.instanceof(Array);
        res[0].email.should.eql(user.email);
      })
        .then(done, done);

    });

    it('should return 404 Not Found', function (done) {

      findUserByEmail(logger, mongoose, 'unkown@user.com').catch(function findUserByEmailError(err) {
        err.code.should.equal(404);
        err.message.should.equal('not_found');
        err.data.should.equal('Account profile not found.');
      })
        .then(done, done);

    });

    it('should handle database errors', function(done) {

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

      sinon.stub(User, 'find', stubFind);

      findUserByEmail(logger, mongoose, user.email).catch(function findUserByEmailError(err) {
        err.code.should.equal(500);
        err.message.should.equal('internal_server_error');
        err.data.should.equal('Internal Server Error.');
      })
        .then(done, done);

    });

  });

});
