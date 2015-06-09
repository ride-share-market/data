'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  mongodbFind = require(config.get('root') + '/app/lib/util/util-mongodb-find');

module.exports = function findById(logger, mongoose, userId) {

  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (userId), 'string', 'argument userId must be a string');

  var deferred = q.defer();

  var findQuery = {
    modelName: 'User',
    conditions: {
      _id: userId
    }
  };

  mongodbFind(logger, mongoose, findQuery).then(
    function mongodbFindSuccess(res) {

      if (!res.length) {
        deferred.reject({
          code: 404,
          message: 'not_found',
          data: 'Account profile not found.'
        });
      }
      else {
        deferred.resolve(res);
      }

    })
    .catch(function (err) {
      deferred.reject(err);
    })
    .done();

  return deferred.promise;

};
