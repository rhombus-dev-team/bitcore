'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-particl');
var utils = require('../utils');
var BufferReader = bitcore.encoding.BufferReader;

/**
 * @param {Number} arg
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
function FeeFilterMessage(arg, options) {
  Message.call(this, options);
  this.command = 'feefilter';
}
inherits(FeeFilterMessage, Message);

FeeFilterMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  parser.readAll();
  utils.checkFinished(parser);
};

FeeFilterMessage.prototype.getPayload = function() {};

module.exports = FeeFilterMessage;
