'use strict';

var assert = require('assert'),
  _ = require('lodash');

/**
 * Function to build the base JSON-RPC reply object
 * @param id
 * @returns {Function}
 */
var setJsonRpcResponse = function setJsonRpcResponse(id) {

  var jsonRpcResponse = {
    jsonrpc: '2.0',
    id: id
  };

  /**
   * Returns a stringify'd JSON-RPC object
   * @param Object JSON-RPC result or error.
   *
   * Example: {result: 'OK'}
   * Example: {error: {code: -32601,message: 'Method not found'}}
   }
   */
  return function jsonRpcResponseAssign(obj) {

    assert.equal(typeof (obj), 'object', 'argument \'obj\' must be an object');

    if(!obj.result && !obj.error) {
      throw new Error('Missing required obj property: \'result\' or \'error\'');
    }

    return JSON.stringify(_.assign(_.clone(jsonRpcResponse), obj));
  };

};

module.exports = setJsonRpcResponse;
