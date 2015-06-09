'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  userValidator = require(config.get('root') + '/app/lib/util/util-json-validate').userValidator,
  findUserByEmail = require('./user-find-by-email'),
  createUser = require('./user-create'),
  updateUserProvider = require('./user-provider-update');

/*
 signin
 * validate schema
 * find existing user
 * TODO: then update (keep old or overwrite?)
 * or create new user
 */
module.exports = function signIn(logger, mongoose, user) {

  assert.equal(typeof (logger), 'object', 'argument \'logger\' must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument \'mongoose\' must be an object');
  assert.equal(typeof (user), 'object', 'argument \'user\' must be an object');

  var deferred = q.defer();

  /**
   * Validate the JSON with zSchema then proceed with request
   */
  userValidator(JSON.stringify(user)).then(function userValidatorSuccess() {
      return findUserByEmail(logger, mongoose, user.email);
    },
    function userValidatorError(err) {
      return q.reject({code: 400, message: JSON.parse(err)});
    })
    .then(
    function findUserByEmailSuccess(res) {
      // Found user, update their existing oauth provider details.
      // Oauth provider details are updated every time (and only) when the user signs in.
      // There is no offline oauth activity/updates.
      return updateUserProvider(logger, mongoose, res[0], user);
      //deferred.resolve(res[0]);
    },
    function findUserByEmail(err) {
      if (err.code && err.code === 404) {
        return createUser(logger, mongoose, user);
      }
      else {
        // userValidatorError Error or findUserByEmail Internal Server Error
        deferred.reject(err);
      }
    })
    .then(
    function createUserSuccess(res) {
      deferred.resolve(res);
    },
    function createUserError(err) {
      deferred.reject(err);
    })
    .done();

  return deferred.promise;

};
