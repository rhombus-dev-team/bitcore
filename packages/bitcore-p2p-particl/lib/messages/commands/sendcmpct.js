'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-particl');
var utils = require('../utils');
var BufferReader = bitcore.encoding.BufferReader;
/**
 * A message to confirm that a connection is still valid.
 * @param {Number} arg - A nonce for the Ping message
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
function SendCmpctMessage(arg, options) {
  Message.call(this, options);
  this.command = 'sendcmpct';
}
inherits(SendCmpctMessage, Message);

SendCmpctMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  parser.readVarintNum();
  parser.readUInt64LEBN();

  utils.checkFinished(parser);
};

SendCmpctMessage.prototype.getPayload = function() {};

module.exports = SendCmpctMessage;
