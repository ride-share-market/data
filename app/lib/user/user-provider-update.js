'use strict';

var assert = require('assert'),
  q = require('q');

module.exports = function userAddProvider(logger, mongoose, existingUser, updateUser) {

  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (existingUser), 'object', 'argument existingUser must be an object');
  assert.equal(typeof (updateUser), 'object', 'argument updateUser must be an object');

  var deferred = q.defer();

  existingUser.providers[updateUser.provider] = updateUser.profile;

  var User = mongoose.model('User');

  User.findByIdAndUpdate(
    existingUser._id,
    {
      currentProvider: updateUser.provider,
      providers: existingUser.providers,
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
