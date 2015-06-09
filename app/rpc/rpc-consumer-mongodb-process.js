'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../config'),
  jsonRpcValidator = require(config.get('root') + '/app/lib/util/util-json-validate').jsonRpcValidator,
  mongoose = require(config.get('root') + '/config/mongodb').mongoose,
  jsonRpcResponseBuilder = require(config.get('root') + '/app/lib/util/util-json-rpc-response-builder'),
  user = require(config.get('root') + '/app/lib/user'),
  rideshare = require(config.get('root') + '/app/lib/rideshare');

// Set the default logging output
var logger = console;

// RPC Method dispatch table
// The properties names on this object defined what JSON-RPC methods this consumer can respond to
var rpcMethodTable = {

  'user.signIn': user.signIn,
  'user.findById': user.findById,

  'rideshare.create': rideshare.create,
  'rideshare.findAll': rideshare.findAll,
  'rideshare.findById': rideshare.findById,
  'rideshare.findByUserId': rideshare.findByUserId,
  'rideshare.update': rideshare.update,
  'rideshare.remove': rideshare.remove

};

/**
 * The callee can set the logger to use for this module
 * @param log
 */
var setLogger = function setLogger(log) {
  logger = log;
};

/**
 * Process the JSON-RPC request
 *
 * @param jsonRpc Object
 * @returns promise
 */
var processJsonRpc = function (jsonRpcString) {

  //throw new Error('Oops! Something exploded!');

  assert.equal(typeof (jsonRpcString), 'string', 'argument \'jsonRpcString\' must be a string');

  // TODO: try/catch
  var jsonRpc = JSON.parse(jsonRpcString);

  var deferred = q.defer();

  var setJsonRpcResponse = jsonRpcResponseBuilder(jsonRpc.id);

  if (rpcMethodTable[jsonRpc.method]) {

    rpcMethodTable[jsonRpc.method](logger, mongoose, jsonRpc.params)
      .then(
      function jsonRpcSuccess(result) {
        deferred.resolve(setJsonRpcResponse({
          result: result
        }));
      },
      function jsonRpcError(err) {
        deferred.reject(setJsonRpcResponse({
          error: {
            code: err.code,
            message: err.message,
            data: err.data
          }
        }));
      })
      .catch(function jsonRpcError(err) {

        // Log the full error
        logger.error(err);

        // Return JSON-RPC pre-definded code and message for 'Internal Error'
        deferred.reject(setJsonRpcResponse({
          error: {
            code: -32603,
            message: 'Internal error'
          }
        }));
      });

  }
  else {

    deferred.reject(setJsonRpcResponse({
      error: {
        code: -32601,
        message: 'Method not found'
      }
    }));

  }

  return deferred.promise;


};

exports.setLogger = setLogger;

exports.jsonRpc = function jsonRpc(msg) {

  var deferred = q.defer();

  jsonRpcValidator(msg.content.toString())
    .then(processJsonRpc)
    .then(function processJsonRpcSuccess(res) {
      deferred.resolve(res);
    })
    .catch(function jsonRpcError(err) {

      // Uncaught Errors from any of the above
      // Log the full error
      logger.error(err);

      deferred.reject(err);
    })
    .done();

  return deferred.promise;

};
