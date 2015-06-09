'use strict';

var should = require('chai').should();

var jsonRpcValidator = require('./util-json-validate').jsonRpcValidator,
  userValidator = require('./util-json-validate').userValidator;

describe('Util', function () {

  describe('JSON Validate', function () {

    describe('JSON-RPC Schema', function () {

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

    describe('User Schema', function () {
      it('should accept valid User JSON', function (done) {

        var jsonInput = JSON.stringify({
          email: 'net@citizen.com',
          provider: 'google',
          profile: {
            name: 'Net Citizen',
            gender: 'male'
          }
        });

        userValidator(jsonInput)
          .then(function success(res) {
            res.should.equal(jsonInput);
          }, function error(err) {
            should.not.exist(err);
          })
          .then(done, done);

      });
    });

  });

});
