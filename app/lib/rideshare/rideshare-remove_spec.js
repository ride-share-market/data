'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  mongoose = mongodb.mongoose,
  createUser = require(config.get('root') + '/app/lib/user/user-create'),
  Rideshare = mongoose.model('Rideshare'),
  createRideshare = require('./rideshare-create'),
  deleteRideshare = require('./rideshare-remove');

var logger,
  newUser = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString()),
  newRideshare1 = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString()),
  newRideshare1Id;

// Connect to database if not already connected from other tests
if (mongoose.connection.readyState === 0) {
  mongodb.connect();
}

describe('Rideshare', function () {

  describe('Remove', function () {

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
        newRideshare1.user = res._id;
      })
        .then(done, done);
    });

    // Add a test rideshare
    beforeEach(function (done) {
      createRideshare(logger, mongoose, newRideshare1).then(function (res) {
        should.exist(res._id);
        res.user.should.equal(newRideshare1.user);
        newRideshare1Id = res._id;
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

        deleteRideshare(logger, mongoose, {id: newRideshare1Id}).then(function (res) {
            res._id.should.eql(newRideshare1Id);
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

        deleteRideshare(logger, mongoose, {id: newRideshare1Id}).catch(function (err) {

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

        deleteRideshare(logger, mongoose, {id: 'abc123'}).catch(function (err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].path.should.equal('id');
            err.data[0].message.should.match(/String\ does\ not\ match\ pattern/);
          })
          .then(done, done);

      });

    });

  });

});
