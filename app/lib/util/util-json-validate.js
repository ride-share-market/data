'use strict';

var assert = require('assert'),
  ZSchema = require('z-schema'),
  q = require('q'),
  _ = require('lodash');

var config = require('../../../config'),
  schemas = require(config.get('root') + '/app/lib/schemas');

module.exports = {
  formatErrorMessages: formatErrorMessages,
  findByEmailValidator: jsonValidation(schemas.findByEmail),
  findByIdValidator: jsonValidation(schemas.findById),
  jsonRpcValidator: jsonValidation(schemas.jsonRpc),
  removeByIdValidator: jsonValidation(schemas.removeById),
  userValidator: jsonValidation(schemas.user),
  rideshareValidator: jsonValidation(schemas.rideshare)
};

/**
 * JSON Validation using zSchema
 * @param schemas Array of schemas for z-schema to compile
 * @returns {Function}
 */
function jsonValidation(schemas) {

  assert.equal(typeof (schemas), 'object', 'argument schemas must be an object');
  assert.equal(typeof (schemas.map), 'function', 'argument schemas must be an array');

  //var validator = new ZSchema({
  //  strictMode: true
  //});

  var validator = new ZSchema();

  // compile & validate schemas first, z-schema will automatically handle array
  // TODO handle errors here
  validator.validateSchema(schemas);

  /**
   * Validate JSON against said schema.
   * @param json String Json to validate.
   * @schemaName String The name of the schema to use for validation.
   * @returns Promise resolve with JSON string or rejected with a JSON.stringfy'd object
   */
  return function(json, schemaName) {

    assert.equal(typeof (json), 'string', 'argument json must be a string');

    var deferred = q.defer();

    var schema = _.findIndex(schemas, function (item) {
      return item.id === schemaName;
    });

    // TODO: try/catch JSON.parse
    validator.validate(JSON.parse(json), schemas[schema]);

    var errors = validator.getLastErrors();

    if (!errors) {
      deferred.resolve(json);
    }
    else {
      var validationErrors = [];
      errors.forEach(function (error) {
        validationErrors.push({path: error.path, message: error.message});
      });
      deferred.reject(JSON.stringify({jsonSchemaErrors: validationErrors}));
    }

    return deferred.promise;
  };
}

/**
 * Formats/strips out chars/cleans up JSON z-schema error message
 *
 * @param errors
 * @returns {*}
 */
function formatErrorMessages(errors) {

  // errors must be an array
  return errors.jsonSchemaErrors.map(function (error) {
    return {
      path: error.path.replace('#/', ''),
      message: error.message
    };
  });

}
