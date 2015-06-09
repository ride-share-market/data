'use strict';

var _ = require('lodash'),
  async = require('async');

/**
 * Check the Mongoose MongoDB connection state every 50ms
 * Call the callback only when state is 1 (connected)
 *
 * @param mongoose
 * @param callback
 */
exports.waitForConnection = function waitForConnection(mongoose, callback) {

  function waitForMongoDbConnectedState() {
    if(mongoose.connection.readyState !== 1) {
      setTimeout(waitForMongoDbConnectedState, 50);
    }
    else {
      callback();
    }
  }

  waitForMongoDbConnectedState();

};

/**
 * Drop the test database, recreate it, rebuild all the indexes
 * When all done call the callback
 *
 * @param mongoose
 * @param callback
 */
exports.resetDatabase = function resetDatabase(mongoose, callback) {

  mongoose.connection.db.command({dropDatabase: 1}, function (err) {
    if (err) {
      console.log('dropDatabase:', err);
    }

    var mongoPath = mongoose.connections[0].host + ':' + mongoose.connections[0].port + '/' + mongoose.connections[0].name;

    //Kill the current connection, then re-establish it
    mongoose.connection.close();

    mongoose.connect('mongodb://' + mongoPath, function (err) {
      if (err) {
        console.log('connect:', err);
      }

      var asyncFunctions = [];

      //Loop through all the known schemas, and execute an ensureIndex to make sure we're clean
      _.each(mongoose.connections[0].base.modelSchemas, function (schema, key) {
        asyncFunctions.push(function (cb) {
          mongoose.model(key, schema).ensureIndexes(function () {
            return cb();
          });
        });
      });

      async.parallel(asyncFunctions, function (err) {
        if (err) {
          console.log('async.parallel', err);
        }
        callback();
      });
    });

  });

};
