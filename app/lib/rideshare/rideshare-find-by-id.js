'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../config'),
  mongodbFind = require(config.get('root') + '/app/lib/util/util-mongodb-find'),
  userFilter = require(config.get('root') + '/app/lib/user/user-profile-filter.js');

module.exports = function findById(logger, mongoose, rideshareId) {

  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (rideshareId), 'string', 'argument rideshareId must be a string');

  var deferred = q.defer();

  var findQuery = {
    modelName: 'Rideshare',
    conditions: {
      _id: rideshareId
    },
    populatePath: 'user',
    populateSelect: {
      email: false
    }
  };

  mongodbFind(logger, mongoose, findQuery).then(
    function mongodbFindSuccess(res) {

      if (!res.length) {
        deferred.reject({
          code: 404,
          message: 'not_found',
          data: 'Rideshare not found.'
        });
      }
      else {

        // We want to filter and alter the returned user properties
        // The MongooseJS User model is preventing this, so we'll strip out
        // the mongoose model behavior, then filter/update the user properties.
        var rideshare = JSON.parse(JSON.stringify(res));
        rideshare[0].user = {
          _id: rideshare[0].user._id,
          providers: userFilter(rideshare[0].user)
        };

        deferred.resolve(rideshare);
      }

    })
    .catch(function (err) {
      deferred.reject(err);
    })
    .done();

  return deferred.promise;

};
