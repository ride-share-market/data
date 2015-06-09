'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  validator = require(config.get('root') + '/app/lib/util/util-json-validate');

var signIn = require('./user-sign-in'),
  findByEmail = require('./user-find-by-email'),
  findById = require('./user-find-by-id');

exports.signIn = signIn;

function validateFindByArguments(logger, mongoose, rpcParams) {
  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (rpcParams), 'object', 'argument rpcParams must be an object');
}

/**
 * Formats/strips out chars/cleans up JSON zschema error message
 *
 * @param errors
 * @returns {*}
 */
function formatErrorMessages(errors) {

  // errors must be an array

  return errors.jsonSchemaErrors.map(function(error) {
    return {
      path: error.path.replace('#/', ''),
      message: error.message
    };
  });

}

exports.findByEmail = function (logger, mongoose, rpcParams) {

  validateFindByArguments(logger, mongoose, rpcParams);

  return validator.findByEmailValidator(JSON.stringify(rpcParams)).then(
    function validatorSuccess() {
      return findByEmail(logger, mongoose, rpcParams.email);
    },
    function validatorError(err) {
      return q.reject({
        code: 400,
        message: 'validation_error',
        data: formatErrorMessages(JSON.parse(err))
      });
    }
  );

};

exports.findById = function (logger, mongoose, rpcParams) {

  validateFindByArguments(logger, mongoose, rpcParams);

  return validator.findByIdValidator(JSON.stringify(rpcParams)).then(
    function validatorSuccess() {
      return findById(logger, mongoose, rpcParams.id);
    },
    function validatorError(err) {
      return q.reject({
        code: 400,
        message: 'validation_error',
        data: formatErrorMessages(JSON.parse(err))
      });
    }
  );

};
