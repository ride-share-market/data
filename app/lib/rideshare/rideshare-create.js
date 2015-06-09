'use strict';

var assert = require('assert'),
  q = require('q'),
  _ = require('lodash');

module.exports = function create(logger, mongoose, rideshare) {

  assert.equal(typeof (logger), 'object', 'argument \'logger\' must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument \'mongoose\' must be an object');
  assert.equal(typeof (rideshare), 'object', 'argument \'rideshare\' must be an object');

  //throw new Error('User Create Exploded!');

  var deferred = q.defer();

  // TODO: zschema validation

  var Rideshare = mongoose.model('Rideshare');

  var newRideshare = new Rideshare(rideshare);

  newRideshare.save(function (err) {
    if (err) {

      logger.error(err);

      // Model validation errors
      if (err.name && err.name === 'ValidationError') {

        deferred.reject({
          code: 400,
          message: 'validation_error',
          data: _.keys(err.errors).map(function (error) {
            return {
              name: err.errors[error].name,
              path: err.errors[error].path,
              type: err.errors[error].type
            };
          })
        });

      }
      else {
        deferred.reject({
          code: 500,
          message: 'internal_server_error',
          data: 'Internal Server Error.'
        });
      }

    }
    else {
      deferred.resolve(newRideshare);
    }
  });

  return deferred.promise;

};
