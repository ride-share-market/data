'use strict';

var path = require('path');

var config = require('./config'),
  log = require(config.get('root') + '/app/lib/log'),
  logger = log.create(path.basename(__filename, '.js')),
  mongoose = require(config.get('root') + '/config/mongodb');

mongoose.connect();

// The RPC process module
var rpcPprocess = require(config.get('root') + '/app/rpc/rpc-consumer-mongodb-process');

// Set the RPC processing to use the same logger as this consumer
rpcPprocess.setLogger(logger);

// Build the RabbitMQ connection string
var rmq = config.get('messageQueue').rabbitmq;

var rmq_url = rmq.user + ':' + rmq.password + '@' + rmq.url + rmq.vhost;

var consumerOptions = {

  url: rmq_url,

  queue: 'rpc_mongodb',

  logInfo: function(msg) {
    logger.info(msg);
  },

  logError: function(msg) {
    logger.error(msg);
  },

  processMessage: rpcPprocess.jsonRpc

};

var consumer = require('amqp-rpc-factory').consumer.create(consumerOptions);

consumer.run();
