'use strict';

var should = require('chai').should(),
  sinon = require('sinon');

var config = require('../../../config'),
  mongodb = require(config.get('root') + '/config/mongodb'),
  mongoose = mongodb.mongoose,
  mongoDbTestUtils = require(config.get('root') + '/test/util/test-util-mongodb'),
  rideshare = require('./index');

var logger;

describe('Rideshare', function () {

  it('should expose CRUD operations', function (done) {
    should.exist(rideshare.create);
    should.exist(rideshare.findAll);
    should.exist(rideshare.findById);
    should.exist(rideshare.findByUserId);
    should.exist(rideshare.update);
    should.exist(rideshare.remove);
    done();
  });

  describe('Find', function () {

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

    describe('Find By ID', function () {

      it('should reject non valid ID format', function (done) {

        rideshare.findById(logger, mongoose, {id: 'abc123'}).catch(function (err) {
          err.code.should.equal(400);
          err.message.should.equal('validation_error');
          err.data[0].path.should.equal('id');
          err.data[0].message.should.equal('String is too short (6 chars), minimum 24');
        })
          .then(done, done);

      });

      it('should return rideshare find results', function (done) {

        rideshare.findById(logger, mongoose, {id: '542ecc5738cd267f52ac2085'}).catch(function findByIdError(err) {
          err.code.should.equal(404);
          err.message.should.equal('not_found');
          err.data.should.equal('Rideshare not found.');
        })
          .then(done, done);

      });

    });

    describe('Find By User ID', function () {

      it('should reject non valid ID format', function (done) {

        rideshare.findByUserId(logger, mongoose, {id: 'abc123'}).catch(function (err) {
          err.code.should.equal(400);
          err.message.should.equal('validation_error');
          err.data[0].path.should.equal('id');
          err.data[0].message.should.equal('String is too short (6 chars), minimum 24');
        })
          .then(done, done);

      });

      it('should return rideshare find results', function (done) {

        rideshare.findByUserId(logger, mongoose, {id: '542ecc5738cd267f52ac2085'}).catch(function findByIdError(err) {
          err.code.should.equal(404);
          err.message.should.equal('not_found');
          err.data.should.equal('Rideshare not found.');
        })
          .then(done, done);

      });

    });

  });

});
