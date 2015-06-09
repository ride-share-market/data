'use strict';

var mongoose = require('mongoose'),
  requireWalk = require('require-walk'),
  path = require('path');

var config = require('./.'),
  log = require(config.get('root') + '/app/lib/log'),
  logger = log.create(path.basename(__filename, '.js'));

// Build the connection string
var dbURI = config.get('database').mongodb.uri;
var dbPort = config.get('database').mongodb.port;
var dbName = config.get('database').mongodb.dbname;

// Mongoose connection events

// Mongoose connecting event
mongoose.connection.on('connecting', function () {
  logger.info('Mongoose connecting to ' + dbURI + ':' + dbPort);
});

// Mongoose conneccted event
mongoose.connection.on('connected', function () {
  logger.info('Mongoose connected to ' + dbURI + ':' + dbPort);
});

// Mongoose open event
mongoose.connection.once('open', function () {
  logger.info('Mongoose connection opened to ' + dbURI + ':' + dbPort);
});

// Mongoose reconnected event
mongoose.connection.on('reconnected', function () {
  logger.info('Mongoose reconnected to ' + dbURI + ':' + dbPort);
});

// Mongoose disconnected event
mongoose.connection.on('disconnected', function () {
  logger.info('Mongoose disconnected');
});

// Mongoose error event
mongoose.connection.on('error', function (error) {
  logger.error('Mongoose: ' + error);
  mongoose.disconnect();
});

// Mongoose SIGINT event
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    logger.info('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

// Bootstrap models
requireWalk = requireWalk(config.get('root') + '/app/models')(mongoose);

/**
 * Connect to MongoDB.
 *
 * Retries on initial connection failure and also existing connections that fail.
 *
 */
var connectWithRetry = function() {
  return mongoose.connect(dbURI + ':' + dbPort + '/' + dbName, {server: {auto_reconnect: true}}, function(err) {
    if (err) {
      var retryInterval = 1000;
      logger.error([
        'Failed to connect to mongodb on startup, retrying in',
        retryInterval,
        'ms.',
        err].join(' '));
      setTimeout(connectWithRetry, retryInterval);
    }
  });
};

/**
 * The mongoose client (dependency injection)
 * Most functions just need to use the existing mongoose connection and models
 */
exports.mongoose = mongoose;

/**
 * For database connection.
 * When a consumer starts and needs a initiate a database connection
 */
exports.connect = connectWithRetry;
