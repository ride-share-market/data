'use strict';

var assert = require('assert'),
  ZSchema = require('z-schema'),
  q = require('q');

var config = require('../../../config'),
  schemas = require(config.get('root') + '/app/lib/schemas');

//var validator = new ZSchema({
//  strictMode: true
//});

var validator = new ZSchema();

/**
 * JSON Validation using zSchema
 * @param schema The name of the JSON Schema to use
 * @returns {Function}
 */
function jsonValidation(schema) {

  assert.equal(typeof (schema), 'object', 'argument \'schema\' must be an object');

  /**
   * Validate JSON against said schema
   * @returns Promise resolve with JSON string or rejected with a JSON.stringfy'd object
   */
  return function(json) {

    assert.equal(typeof (json), 'string', 'argument \'json\' must be a string');

    var deferred = q.defer();

    // TODO: try/catch JSON.parse
    validator.validate(JSON.parse(json), schema);
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
 * Formats/strips out chars/cleans up JSON zschema error message
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

module.exports = {
  findByEmailValidator: jsonValidation(schemas.findByEmail),
  findByIdValidator: jsonValidation(schemas.findById),
  formatErrorMessages: formatErrorMessages,
  jsonRpcValidator: jsonValidation(schemas.jsonRpc),
  removeByIdValidator: jsonValidation(schemas.removeById),
  userValidator: jsonValidation(schemas.user)
};
