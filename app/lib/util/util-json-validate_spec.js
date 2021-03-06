'use strict';

var should = require('chai').should(),
  fs = require('fs');

var config = require('../../../config'),
  jsonRpcValidator = require('./util-json-validate').jsonRpcValidator,
  userValidator = require('./util-json-validate').userValidator,
  rideshareValidator = require('./util-json-validate').rideshareValidator;

var newUserFacebookFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-facebook.json').toString())),
  newUserGoogleFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString())),
  newRideshareFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString())),
  updateRideshareFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_put_200_rideshare_1.json').toString()));

describe('Util', function () {

  describe('JSON Schema Validate', function () {

    describe('JSON-RPC', function () {

      it('should reject invalid JSON-RPC JSON', function (done) {

        var jsonInput = JSON.stringify({});

        jsonRpcValidator(jsonInput, 'jsonRpc').catch(function (err) {
          should.exist(err);
          err.code.should.equal(400);
          err.message.should.equal('validation_error');
          err.data[0].message.should.equal('Missing required property: id');
          err.data[1].message.should.equal('Missing required property: params');
          err.data[2].message.should.equal('Missing required property: method');
          err.data[3].message.should.equal('Missing required property: jsonrpc');
        })
          .then(done, done);

      });

      it('should accept valid JSON-RPC JSON', function (done) {

        var jsonInput = JSON.stringify({
          jsonrpc: '2.0',
          method: 'findOne',
          params: {
            email: 'net@citizen.com'
          },
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        });

        jsonRpcValidator(jsonInput, 'jsonRpc').then(function (res) {
          res.should.equal(jsonInput);
        })
          .then(done, done);

      });
    });

    describe('User', function () {

      it('should accept valid Facebook user JSON', function (done) {

        userValidator(newUserFacebookFixture, 'new').then(function (res) {
          res.should.equal(newUserFacebookFixture);
        })
          .then(done, done);

      });

      it('should accept valid Google user JSON', function (done) {

        userValidator(newUserGoogleFixture, 'new').then(function (res) {
          res.should.equal(newUserGoogleFixture);
        })
          .then(done, done);

      });

    });

    describe('Rideshare', function () {

      describe('new', function () {

        it('should reject if missing required rideshare properties', function (done) {

          rideshareValidator(newRideshareFixture, 'new').catch(function (err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].message.should.equal('Missing required property: user');
          })
            .then(done, done);

        });

        it('should validate a new rideshare', function (done) {

          var validNewRideshareFixture = JSON.parse(newRideshareFixture);
          validNewRideshareFixture.user = '558ac201041d5b0452c8447e';
          validNewRideshareFixture = JSON.stringify(validNewRideshareFixture);

          rideshareValidator(validNewRideshareFixture, 'new').then(function (res) {
            res.should.equal(validNewRideshareFixture);
          })
            .then(done, done);

        });

        it('should reject additional rideshare properties', function (done) {

          var invalidNewRideshareFixture = JSON.parse(newRideshareFixture);
          invalidNewRideshareFixture.user = '558ac201041d5b0452c8447e';
          invalidNewRideshareFixture.color = 'Blue';
          invalidNewRideshareFixture = JSON.stringify(invalidNewRideshareFixture);

          rideshareValidator(invalidNewRideshareFixture, 'new').catch(function (err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].message.should.equal('Additional properties not allowed: color');
          })
            .then(done, done);

        });

      });

      describe('update', function () {

        it('should validate an existing rideshare', function (done) {
          rideshareValidator(updateRideshareFixture, 'update').then(function (res) {
            res.should.equal(updateRideshareFixture);
          })
            .then(done, done);
        });

        it('should reject additional update rideshare properties', function (done) {

          var invalidUpdateRideshareFixture = JSON.parse(updateRideshareFixture);
          invalidUpdateRideshareFixture.color = 'Blue';
          invalidUpdateRideshareFixture = JSON.stringify(invalidUpdateRideshareFixture);

          rideshareValidator(invalidUpdateRideshareFixture, 'update').catch(function (err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].message.should.equal('Additional properties not allowed: color');
          })
            .then(done, done);

        });

        it('should reject missing required update rideshare properties', function (done) {

          var invalidUpdateRideshareFixture = JSON.parse(updateRideshareFixture);
          delete invalidUpdateRideshareFixture._id;
          invalidUpdateRideshareFixture = JSON.stringify(invalidUpdateRideshareFixture);

          rideshareValidator(invalidUpdateRideshareFixture, 'update').catch(function (err) {
            err.code.should.equal(400);
            err.message.should.equal('validation_error');
            err.data[0].message.should.equal('Missing required property: _id');
          })
            .then(done, done);

        });

      });

    });

  });

});
