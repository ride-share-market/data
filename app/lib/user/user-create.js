'use strict';

var assert = require('assert'),
  q = require('q');

module.exports = function create(logger, mongoose, user) {

  assert.equal(typeof (logger), 'object', 'argument \'logger\' must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument \'mongoose\' must be an object');
  assert.equal(typeof (user), 'object', 'argument \'user\' must be an object');

  //throw new Error('User Create Exploded!');

  var deferred = q.defer();

  // TODO: zschema validation

  var User = mongoose.model('User');

  var newUser = new User({
    email: user.email,
    currentProvider: user.provider,
    providers: {}
  });

  newUser.providers[user.provider] = user.profile;

  newUser.save(function (err) {
    if (err) {

      logger.error(err);

      if (err.code && err.code === 11000) {

        //10.4.10 409 Conflict

        deferred.reject({
          code: 409,
          message: 'email_conflict',
          data: 'This email account already exists.'
        });
      }
      else {

        // TODO: Handle Model validation errors
        deferred.reject({
          code: 500,
          message: 'internal_server_error',
          data: 'Internal Server Error.'
        });
      }
    }
    else {
      deferred.resolve(newUser);
    }
  });

  return deferred.promise;

};
