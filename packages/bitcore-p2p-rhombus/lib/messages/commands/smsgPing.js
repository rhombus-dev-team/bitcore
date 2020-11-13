'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-rhombus');

/**
 * A message to confirm that a connection is still valid.
 * @param {Number} arg - A nonce for the Ping message
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
function SMSGPingMessage(arg, options) {
  Message.call(this, options);
  this.command = 'smsgPing';
}
inherits(SMSGPingMessage, Message);

SMSGPingMessage.prototype.setPayload = function(payload) {};

SMSGPingMessage.prototype.getPayload = function() {};

module.exports = SMSGPingMessage;
