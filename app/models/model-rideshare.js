'use strict';

var assert = require('assert');

module.exports = function (mongoose) {

  var Schema = mongoose.Schema;

  var RideshareSchema = new Schema({

    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },

    created_at: {
      type: Date,
      default: Date.now,
      index: true
    },

    updated_at: {
      type: Date,
      default: Date.now
    },

    itinerary: {
      type: {},
      required: true
    },

    messages: [
      {
        created_at: {
          type: Date,
          default: Date.now
        },
        sessionId: {
          type: String,
          required: true
        },
        userIdFrom: {
          type: Schema.ObjectId,
          ref: 'User',
          required: true
        },
        message: {
          type: String,
          required: true
        },
        // Responses from Mandrill's API
        responses: []

      }
    ]

  });

    // Build Indexes manually
    RideshareSchema.set('autoIndex', false);

  /**
   * Validations
   */

//var blankValidator = function (val) {
//  if (val && val.length >= 1) {
//    return true;
//  }
//  return false;
//};
//
//var lengthValidator = function (val) {
//  if (val && val.length >= 3) {
//    return true;
//  }
//  return false;
//};
//
//RideshareSchema.path('origin').validate(blankValidator, 'cannot be blank');
//RideshareSchema.path('origin').validate(lengthValidator, 'must be at least 3 characters');
//
//RideshareSchema.path('destination').validate(blankValidator, 'cannot be blank');
//RideshareSchema.path('destination').validate(lengthValidator, 'must be at least 3 characters');

  /**
   * Statics
   */

  /**
   * #load Finds one rideshare w/ it's user
   *
   * @param id BSON::ObjectId
   * @param callback function
   *
   * @returns Mongoose <Query>
   */
  RideshareSchema.statics.load = function (id, callback) {

    // input validation
    assert.ok(/^[0-9a-fA-F]{24}$/.test(id),
      'argument \'id\' must consist of 24 hexadecimal characters');

    assert.equal(typeof (callback), 'function');

    this.findOne({
      _id: id
    }).populate('user', 'name username').exec(callback);

  };

  mongoose.model('Rideshare', RideshareSchema);

};
