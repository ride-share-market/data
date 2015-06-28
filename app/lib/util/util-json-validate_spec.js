'use strict';

var should = require('chai').should(),
  fs = require('fs');

var config = require('../../../config'),
  jsonRpcValidator = require('./util-json-validate').jsonRpcValidator,
  userValidator = require('./util-json-validate').userValidator,
  formatErrorMessages = require('./util-json-validate').formatErrorMessages;

var newUserFacebookFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-facebook.json').toString())),
  newUserGoogleFixture = JSON.stringify(JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/new-user-google.json').toString()));

describe('Util', function () {

  describe('JSON Schema Validate', function () {

    describe('JSON-RPC', function () {

      it('should reject invalid JSON-RPC JSON', function (done) {

        var jsonInput = JSON.stringify({});

        jsonRpcValidator(jsonInput)
          .then(console.warn, function error(err) {
            should.exist(err);

            var errors = JSON.parse(err);

            should.exist(errors.jsonSchemaErrors);

            errors.jsonSchemaErrors.length.should.equal(4);

            errors.jsonSchemaErrors[0].path.should.equal('#/');
            errors.jsonSchemaErrors[0].message.should.equal('Missing required property: id');

            errors.jsonSchemaErrors[1].path.should.equal('#/');
            errors.jsonSchemaErrors[1].message.should.equal('Missing required property: params');

            errors.jsonSchemaErrors[2].path.should.equal('#/');
            errors.jsonSchemaErrors[2].message.should.equal('Missing required property: method');

            errors.jsonSchemaErrors[3].path.should.equal('#/');
            errors.jsonSchemaErrors[3].message.should.equal('Missing required property: jsonrpc');
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

        jsonRpcValidator(jsonInput)
          .then(function success(res) {
            res.should.equal(jsonInput);
          }, function error(err) {
            should.not.exist(err);
          })
          .then(done, done);

      });
    });

    describe('User', function () {

      it('should accept valid Facebook user JSON', function (done) {

        userValidator(newUserFacebookFixture).then(function (res) {
            res.should.equal(newUserFacebookFixture);
          })
          .then(done, done);

      });

      it('should accept valid Google user JSON', function (done) {

        userValidator(newUserGoogleFixture).then(function (res) {
          res.should.equal(newUserGoogleFixture);
        })
          .then(done, done);

      });

    });

    describe('Format error messages', function() {

      it('should remove "#!" from the path property', function(done) {
        userValidator('{}').catch(function (err) {
          var errors = JSON.parse(err);
          errors.jsonSchemaErrors[0].path.should.equal('#/');

          var formattedErrors = formatErrorMessages(errors);
          formattedErrors[0].path.should.equal('');
        })
          .then(done, done);
      });

    })

  });

});
