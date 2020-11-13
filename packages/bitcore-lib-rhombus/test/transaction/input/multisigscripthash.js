'use strict';
/* jshint unused: false */

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash');

var bitcore = require('../../..');
var Transaction = bitcore.Transaction;
var PrivateKey = bitcore.PrivateKey;
var Address = bitcore.Address;
var Script = bitcore.Script;
var Signature = bitcore.crypto.Signature;
var MultiSigScriptHashInput = bitcore.Transaction.Input.MultiSigScriptHash;

describe('MultiSigScriptHashInput', function() {

  var privateKey1 = new PrivateKey('H7V98fqZzce4Q1G13GE4deMnjNRkvxxDbAx3qh5hwzvPF5aUzv4p');
  var privateKey2 = new PrivateKey('H33UHCo3XSK6ESAZCy3CuUp6cAuijem3gbq8CgGpsDv6StUMQSyC');
  var privateKey3 = new PrivateKey('H3m9vaGmkdW8xCvmYcFjmHSJMcFeQNhiyibRx5PEibBW8DfJYj2k');
  var public1 = privateKey1.publicKey;
  var public2 = privateKey2.publicKey;
  var public3 = privateKey3.publicKey;
  var address = new Address('RTiWfVL9ZBviTkfRYaZvUv1nKtRBsNUt5h');

  var output = {
    address: 'RTiWfVL9ZBviTkfRYaZvUv1nKtRBsNUt5h',
    txId: '66e64ef8a3b384164b78453fa8c8194de9a473ba14f89485a0e433699daec140',
    outputIndex: 0,
    script: new Script(address),
    satoshis: 1000000
  };
  it('can count missing signatures', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];

    input.countSignatures().should.equal(0);

    transaction.sign(privateKey1);
    input.countSignatures().should.equal(1);
    input.countMissingSignatures().should.equal(1);
    input.isFullySigned().should.equal(false);

    transaction.sign(privateKey2);
    input.countSignatures().should.equal(2);
    input.countMissingSignatures().should.equal(0);
    input.isFullySigned().should.equal(true);
  });
  it('returns a list of public keys with missing signatures', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];

    _.every(input.publicKeysWithoutSignature(), function(publicKeyMissing) {
      var serialized = publicKeyMissing.toString();
      return serialized === public1.toString() ||
              serialized === public2.toString() ||
              serialized === public3.toString();
    }).should.equal(true);
    transaction.sign(privateKey1);
    _.every(input.publicKeysWithoutSignature(), function(publicKeyMissing) {
      var serialized = publicKeyMissing.toString();
      return serialized === public2.toString() ||
              serialized === public3.toString();
    }).should.equal(true);
  });
  it('can clear all signatures', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000)
      .sign(privateKey1)
      .sign(privateKey2);

    var input = transaction.inputs[0];
    input.isFullySigned().should.equal(true);
    input.clearSignatures();
    input.isFullySigned().should.equal(false);
  });
  it('can estimate how heavy is the output going to be', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    input._estimateSize().should.equal(257);
  });
  it('uses SIGHASH_ALL by default', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var sigs = input.getSignatures(transaction, privateKey1, 0);
    sigs[0].sigtype.should.equal(Signature.SIGHASH_ALL);
  });
  it('roundtrips to/from object', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000)
      .sign(privateKey1);
    var input = transaction.inputs[0];
    var roundtrip = new MultiSigScriptHashInput(input.toObject(), null, null, null, true);
    roundtrip.toObject().should.deep.equal(input.toObject());
  });
  it('roundtrips to/from object when not signed', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var roundtrip = new MultiSigScriptHashInput(input.toObject(), null, null, null, true);
    roundtrip.toObject().should.deep.equal(input.toObject());
  });
  it('will get the scriptCode for nested witness', function() {
    var address = Address.createMultisig([public1, public2, public3], 2, 'testnet', true);
    var utxo = {
      address: address.toString(),
      txId: '66e64ef8a3b384164b78453fa8c8194de9a473ba14f89485a0e433699daec140',
      outputIndex: 0,
      script: new Script(address),
      satoshis: 1000000
    };
    var transaction = new Transaction()
      .from(utxo, [public1, public2, public3], 2, true, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var scriptCode = input.getScriptCode();
    scriptCode.toString('hex').should.equal('69522103060a68a85bee0be7460c8b6f37803e8921c2636c660c0977cbc8c6c71cd5c60321035fbc1c004b351b092dc69957931640eeb002127021ec326f66c16286290283e22103854539244458ac1352c9b27377fd9bab63c4eb7904b36029c8b5ca92a5af452853ae');
  });
  it('will get the satoshis buffer for nested witness', function() {
    var address = Address.createMultisig([public1, public2, public3], 2, 'testnet', true);
    var utxo = {
      address: address.toString(),
      txId: '66e64ef8a3b384164b78453fa8c8194de9a473ba14f89485a0e433699daec140',
      outputIndex: 0,
      script: new Script(address),
      satoshis: 1000000
    };
    var transaction = new Transaction()
      .from(utxo, [public1, public2, public3], 2, true, [], true)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var satoshisBuffer = input.getSatoshisBuffer();
    satoshisBuffer.toString('hex').should.equal('40420f0000000000');
  });

});
