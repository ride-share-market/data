'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  validator = require(config.get('root') + '/app/lib/util/util-json-validate');


function validateRpcParams(rpcParams) {

  return validator.removeByIdValidator(JSON.stringify(rpcParams)).then(
    function validatorSuccess() {
      return q.resolve();
    },
    function validatorError(err) {
      return q.reject({
        code: 400,
        message: 'validation_error',
        data: validator.formatErrorMessages(JSON.parse(err))
      });
    }
  );

}

module.exports = function removeRideshare(logger, mongoose, rpcParams) {

  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (rpcParams), 'object', 'argument rpcParams must be an object');

  var deferred = q.defer();

  var Rideshare = mongoose.model('Rideshare');

  validateRpcParams(rpcParams).then(
    function validateRpcParamsSuccess() {
      Rideshare.findByIdAndRemove(rpcParams.id, {select: '_id'}, function(err, doc) {
          if (err) {
            logger.error(err);
            deferred.reject({
              code: 500,
              message: 'internal_server_error',
              data: 'Internal Server Error.'
            });
          }
          else {
            if(!doc) {
              logger.error('404 Remove RideshareId: ' + rpcParams.id);
              deferred.reject({
                code: 404,
                message: 'not_found',
                data: 'Rideshare not found.'
              });
            }
            else {
              deferred.resolve(doc);
            }
          }
      });
    },
    function validateRpcParamsError(err) {
      deferred.reject(err);
    }
  );

  return deferred.promise;

};
