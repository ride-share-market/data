'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  validator = require(config.get('root') + '/app/lib/util/util-json-validate');

var createRideshare = require('./rideshare-create'),
  findAllRideshares = require('./rideshare-find-all'),
  findRideshareById = require('./rideshare-find-by-id'),
  findRideshareByUserId = require('./rideshare-find-by-user-id'),
  updateRideshare = require('./rideshare-update'),
  removeRideshare = require('./rideshare-remove');

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
  return errors.jsonSchemaErrors.map(function (error) {
    return {
      path: error.path.replace('#/', ''),
      message: error.message
    };
  });

}

function findById(logger, mongoose, rpcParams) {

  validateFindByArguments(logger, mongoose, rpcParams);

  return validator.findByIdValidator(JSON.stringify(rpcParams)).then(
    function validatorSuccess() {
      return findRideshareById(logger, mongoose, rpcParams.id);
    },
    function validatorError(err) {
      return q.reject({
        code: 400,
        message: 'validation_error',
        data: formatErrorMessages(JSON.parse(err))
      });
    }
  );

}

function findByUserId(logger, mongoose, rpcParams) {

  validateFindByArguments(logger, mongoose, rpcParams);

  return validator.findByIdValidator(JSON.stringify(rpcParams)).then(
    function validatorSuccess() {
      return findRideshareByUserId(logger, mongoose, rpcParams.id);
    },
    function validatorError(err) {
      return q.reject({
        code: 400,
        message: 'validation_error',
        data: formatErrorMessages(JSON.parse(err))
      });
    }
  );

}

module.exports = {
  create: createRideshare,
  findAll: findAllRideshares,
  findById: findById,
  findByUserId: findByUserId,
  update: updateRideshare,
  remove: removeRideshare
};
