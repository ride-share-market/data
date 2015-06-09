'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev',
  path = require('path'),
  nconf = require('nconf');

/**
 * Setup nconf to use (in-order):
 * 1. Command-line arguments
 * 2. Environment variables
 * 3. JSON config file. Eg env/development.json
 */
nconf.argv()
  .env()
  .file({ file: __dirname + '/env/' + env + '.json' });

nconf.defaults({
  root: path.normalize(__dirname + './..'),
  logDir: 'log'
});

module.exports = nconf;
