'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  userValidator = require(config.get('root') + '/app/lib/util/util-json-validate').userValidator;

module.exports = function createValidUser(logger, mongoose, user) {
  return validateUser(user).then(function() {
    return createUser(logger, mongoose, user);
  });
};

function validateUser(user) {
  return userValidator(JSON.stringify(user), 'new');
}

function createUser(logger, mongoose, user) {

  assert.equal(typeof (logger), 'object', 'argument LOGGER must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument MONGOOSE must be an object');
  assert.equal(typeof (user), 'object', 'argument USER must be an object');

  var deferred = q.defer();

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

        // TODO: Handle Mongoose model validation errors
        // Apart from duplicate email error above, pretty much all else should
        // be validated by z-schema in the call to userValidator prior to this function

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

}
