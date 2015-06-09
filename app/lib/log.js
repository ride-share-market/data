'use strict';

var bunyan = require('bunyan'),
  path = require('path');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
  config = require('./../../config/.');

exports.create = function (name) {

  var logger = bunyan.createLogger({
    name: name,
    streams: [
      {
        path: path.join(config.get('root'), config.get('logDir')) + '/' + name + '_' + env + '.log'
      }
    ]
  });

  return logger;

};
