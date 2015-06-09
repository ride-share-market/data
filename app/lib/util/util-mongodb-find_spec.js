'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  User = mongoose.model('User'),
  mongodbFind = require('./util-mongodb-find');

var logger,
  user1 = {
    email: 'user1@util-mongodb-query.com',
    provider: 'google',
    profile: {
      name: 'One Testname'
    }
  },
  user2 = {
    email: 'user2@util-mongodb-query.com',
    provider: 'google',
    profile: {
      name: 'Two Testname'
    }
  };

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Util', function() {

  describe('MongoDB Query', function() {

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

      createUser(logger, mongoose, user1)
        .then(function createUserSuccess(res) {
          should.exist(res._id);
          user1._id = res._id;
          createUser(logger, mongoose, user2)
            .then(function createUserSuccess(res) {
              should.exist(res._id);
              user2._id = res._id;
              done();
            });
        }, console.error);

    });

    afterEach(function (done) {
      if (User.find.restore) {
        User.find.restore();
      }
      done();
    });

    it('should find one user', function(done) {

      var findQuery = {
        modelName: 'User',
        conditions: {_id: user1._id}
      };

      mongodbFind(logger, mongoose, findQuery).then(function mongodbFindSuccess(res) {
        res.should.be.instanceof(Array);
        res.length.should.equal(1);
        res[0]._id.should.eql(user1._id);
      })
      .then(done, done);

    });

    it('should find all users', function(done) {
      mongodbFind(logger, mongoose, {modelName: 'User'}).then(function mongodbFindSuccess(res) {
        res.should.be.instanceof(Array);
        res.length.should.equal(2);
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

      sinon.stub(User, 'find', stubFind);

      mongodbFind(logger, mongoose, {modelName: 'User'})
        .catch(function mongodbFindError(err) {

          // test logging was done
          sinon.assert.calledOnce(logger.error);

          err.code.should.equal(500);
          err.message.should.equal('internal_server_error');
          err.data.should.equal('Internal Server Error.');
        })
        .then(done, done);

    });

  });

});
