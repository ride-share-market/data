'use strict';

var should = require('chai').should(),
  //assert = require('chai').assert,
  sinon = require('sinon'),
  fs = require('fs');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  Rideshare = mongoose.model('Rideshare'),
  createRideshare = require('./rideshare-create');

var logger,
  newUser = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString()),
  newRideshare = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString());

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

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
    beforeEach(function (done) {
      logger = {
        error: sinon.spy()
      };
      done();
    });

    // Add a test user
    beforeEach(function (done) {

      createUser(logger, mongoose, newUser).then(function (res) {
        should.exist(res._id);
        newRideshare.user = res._id;
      })
        .then(done, done);

    });

    afterEach(function (done) {
      if (Rideshare.prototype.save.restore) {
        Rideshare.prototype.save.restore();
      }
      done();
    });

    it('should save a new Rideshare', function (done) {

      createRideshare(logger, mongoose, newRideshare).then(function (res) {
          should.exist(res._id);
          res.user.should.equal(newRideshare.user);
        })
        .then(done, done);

    });

    //it('should handle mongoose model validation errors', function (done) {
    //
    //  createRideshare(logger, mongoose, {invalid: true})
    //    .then(console.error, function createRideshareError(err) {
    //
    //      // test logging was done
    //      sinon.assert.calledOnce(logger.error);
    //
    //      err.code.should.equal(400);
    //      err.message.should.equal('validation_error');
    //
    //      assert.isArray(err.data, 'Error data should be an Array');
    //      err.data[0].hasOwnProperty('name').should.be.true;
    //      err.data[0].hasOwnProperty('path').should.be.true;
    //      err.data[0].hasOwnProperty('type').should.be.true;
    //      err.data[0].name.should.equal('ValidatorError');
    //    })
    //    .then(done, done);
    //
    //});

    it('should handle unexpected save errors', function (done) {

      var stubSave = function (callback) {
        callback(new Error('Stubbed save()'));
      };

      sinon.stub(Rideshare.prototype, 'save', stubSave);

      createRideshare(logger, mongoose, newRideshare)
        .then(console.error, function createRideshareError(err) {

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
