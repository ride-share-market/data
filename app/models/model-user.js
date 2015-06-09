'use strict';

var assert = require('assert');

module.exports = function (mongoose) {

  var Schema = mongoose.Schema;

  var UserSchema = new Schema({
    email: {
      type: String,
      unique: true
    },
    currentProvider: String,
    providers: Schema.Types.Mixed
  });

  // Build Indexes manually
  UserSchema.set('autoIndex', false);

  /**
   * #load Finds one user
   *
   * @param id BSON::ObjectId
   * @param callback function
   *
   * @returns Mongoose <Query>
   */
  UserSchema.statics.load = function (id, callback) {

    // input validation
    assert.ok(/^[0-9a-fA-F]{24}$/.test(id),
      'argument \'id\' must consist of 24 hexadecimal characters');

    assert.equal(typeof (callback), 'function');

    this.findOne({
      _id: id
    }).exec(callback);
  };

  mongoose.model('User', UserSchema);

};
