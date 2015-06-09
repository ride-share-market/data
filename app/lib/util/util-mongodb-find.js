'use strict';

var assert = require('assert'),
  q = require('q');

/**
 * Runs a MongoDB find() query
 *
 * @param logger
 * @param mongoose
 * @param query Object with values for a MongooseJS find()
 *
 * @returns {Q.promise} Array of zero or more objects
 */
module.exports = function mongodbFind(logger, mongoose, query) {

  assert.equal(typeof (logger), 'object', 'argument logger must be an object');
  assert.equal(typeof (mongoose), 'object', 'argument mongoose must be an object');
  assert.equal(typeof (query), 'object', 'argument query must be an object');

  // The model name must be provided
  assert.equal(typeof (query.modelName), 'string', 'argument query.modelName must be a string');

  // Optional mongoose find values
  var findConditions = query.conditions || {},
    findFields = query.fields || {},
    findOptions = query.options || {};

  // Optional mongoose find values type validation
  assert.equal(typeof (findConditions), 'object', 'argument query.conditions must be an object');
  assert.equal(typeof (findFields), 'object', 'argument query.fields must be an object');
  assert.equal(typeof (findOptions), 'object', 'argument query.options must be an object');

  // Optional mongoose query populate values
  var populatePath = query.populatePath || '',
    populateSelect = query.populateSelect || {};

  // Optional mongoose query populate values type validation
  assert.equal(typeof (populatePath), 'string', 'argument query.populatePath must be a string');
  assert.equal(typeof (populateSelect), 'object', 'argument query.populateSelect must be an object');

  var deferred = q.defer();

  var Model = mongoose.model(query.modelName);

  Model
    .find(findConditions, findFields, findOptions)
    .populate(populatePath, populateSelect)
    .exec(function (err, doc) {
    if (err) {

      logger.error(err);

      // TODO: Handle Model validation errors
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
