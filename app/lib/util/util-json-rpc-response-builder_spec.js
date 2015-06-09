'use strict';

var should = require('chai').should();

var jsonRpcResponseBuilder = require('./util-json-rpc-response-builder');

describe('Util', function () {

  describe('JSON RPC Response Builder', function () {

    it('should return a function', function(done) {

      // keep JSHint happy
      should.exist(done);

      (typeof jsonRpcResponseBuilder(101)).should.equal('function');
      done();

    });

    it('should return stringify\'d JSON-RPC', function(done) {

      var setJsonRpcResponse = jsonRpcResponseBuilder('1234-abc-1234');

      setJsonRpcResponse({result: 'OK'}).should.equal('{"jsonrpc":"2.0","id":"1234-abc-1234","result":"OK"}');

      done();
    });

    it('should handle invalid response object input', function(done) {

      var setJsonRpcResponse = jsonRpcResponseBuilder('1234-abc-1234');

      var fn;

      fn = function() {
        setJsonRpcResponse();
      };
      fn.should.throw('argument \'obj\' must be an object');

      fn = function() {
        setJsonRpcResponse({key: 'value'});
      };
      fn.should.throw('Missing required obj property: \'result\' or \'error\'');

      done();
    });

  });

});
