'use strict';

var rpcPublisherFactory = require('amqp-rpc-factory').publisher;

var publisher = rpcPublisherFactory.create({
  standalone: true,
  url: process.env.RABBITMQ_URL || 'localhost',
  queue: 'rpc_mongodb'
});

var jsonRpcMessage;

//jsonRpcMessage = JSON.stringify({
//  jsonrpc: '2.0',
//  method: 'user.signin',
//  params: {
//    email: 'net@citizen.com',
//    provider: 'google',
//    profile: {
//      name: 'Net Citizen',
//      gender: 'male'
//    }
//  },
//  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
//});

jsonRpcMessage = JSON.stringify({
  jsonrpc: '2.0',
  method: 'user.findById',
  params: {
    id: '542ecc5738cd267f52ac2085'
  },
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

publisher.publish(jsonRpcMessage)
  .then(function publishSuccess(res) {

    /**
     * The result of a successfully published RabbitMQ message may be:
     *
     * 1) A valid JSON-RPC response will have the property res.jsonrpc may contain res.result or res.error
     *
     * 2) A JSON-RPC validation error will contain res.jsonRpcValidationErrors
     *
     * 3) Everything else are unexpected Errors
     *
     */

    try {
      var jsonRpcResponse = JSON.parse(res);

      if (jsonRpcResponse.jsonrpc) {
        console.log('RPC Result', res);
      }
      else {
        console.log('RPC Error 1', res);
      }
    }
    catch (e) {
      console.log('RPC Error 2:', e);
      console.log('RPC Error 3', res);
    }

  })
  .catch(function publishError(err) {
    console.log('publishError', err);
  });
