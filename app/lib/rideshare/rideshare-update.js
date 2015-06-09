'use strict';

var assert = require('assert'),
  q = require('q');

module.exports = function update(logger, mongoose, rideshare) {

  assert.equal(typeof (logger), 'object', 'argument \'logger\' must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument \'mongoose\' must be an object');
  assert.equal(typeof (rideshare), 'object', 'argument \'rideshare\' must be an object');

  var deferred = q.defer();

  // TODO: zschema validation

  var Rideshare = mongoose.model('Rideshare');

  Rideshare.findByIdAndUpdate(
    rideshare._id,
    {
      itinerary: rideshare.itinerary,
      updated_at: Date.now()
    },
    {
      new: true
    },
    function (err, doc) {
      if (err) {
        logger.error(err);
        deferred.reject({
          code: 500,
          message: 'internal_server_error',
          data: 'Internal Server Error.'
        });
      }
      else {
        deferred.resolve(doc);
      }
    });

  return deferred.promise;

};
