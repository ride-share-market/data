'use strict';

var fs = require('fs'),
  path = require('path');

function parseJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename)));
}

module.exports = {
  findByEmail: parseJson('schema-find-by-email.json'),
  findById: parseJson('schema-find-by-id.json'),
  jsonRpc: parseJson('schema-json-rpc.json'),
  removeById: parseJson('schema-remove-by-id.json'),
  user: parseJson('schema-user.json')
};
