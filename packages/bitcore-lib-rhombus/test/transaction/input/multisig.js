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
var MultiSigInput = bitcore.Transaction.Input.MultiSig;

describe('MultiSigInput', function() {

  var privateKey1 = new PrivateKey('H7V98fqZzce4Q1G13GE4deMnjNRkvxxDbAx3qh5hwzvPF5aUzv4p');
  var privateKey2 = new PrivateKey('H33UHCo3XSK6ESAZCy3CuUp6cAuijem3gbq8CgGpsDv6StUMQSyC');
  var privateKey3 = new PrivateKey('H3m9vaGmkdW8xCvmYcFjmHSJMcFeQNhiyibRx5PEibBW8DfJYj2k');
  var public1 = privateKey1.publicKey;
  var public2 = privateKey2.publicKey;
  var public3 = privateKey3.publicKey;
  var address = new Address('RAmfhf84vGeBqd9fkFFaomfYibAhoCVmGt');

  var output = {
    txId: '66e64ef8a3b384164b78453fa8c8194de9a473ba14f89485a0e433699daec140',
    outputIndex: 0,
    script: new Script("522103060a68a85bee0be7460c8b6f37803e8921c2636c660c0977cbc8c6c71cd5c60321035fbc1c004b351b092dc69957931640eeb002127021ec326f66c16286290283e22103854539244458ac1352c9b27377fd9bab63c4eb7904b36029c8b5ca92a5af452853ae"),
    satoshis: 1000000
  };
  it('can count missing signatures', function() {
    var transaction = new Transaction()
        .from(output, [public1, public2, public3], 2)
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
  it('can count missing signatures, signed with key 3 and 1', function() {
    var transaction = new Transaction()
        .from(output, [public1, public2, public3], 2)
        .to(address, 1000000);
    var input = transaction.inputs[0];

    input.countSignatures().should.equal(0);

    transaction.sign(privateKey3);
    input.countSignatures().should.equal(1);
    input.countMissingSignatures().should.equal(1);
    input.isFullySigned().should.equal(false);

    transaction.sign(privateKey1);
    input.countSignatures().should.equal(2);
    input.countMissingSignatures().should.equal(0);
    input.isFullySigned().should.equal(true);
  });
  it('returns a list of public keys with missing signatures', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2)
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
      .from(output, [public1, public2, public3], 2)
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
      .from(output, [public1, public2, public3], 2)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    input._estimateSize().should.equal(147);
  });
  it('uses SIGHASH_ALL by default', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var sigs = input.getSignatures(transaction, privateKey1, 0);
    sigs[0].sigtype.should.equal(Signature.SIGHASH_ALL);
  });
  it('roundtrips to/from object', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2)
      .to(address, 1000000)
      .sign(privateKey1);
    var input = transaction.inputs[0];
    var roundtrip = new MultiSigInput(input.toObject());
    roundtrip.toObject().should.deep.equal(input.toObject());
  });
  it('roundtrips to/from object when not signed', function() {
    var transaction = new Transaction()
      .from(output, [public1, public2, public3], 2)
      .to(address, 1000000);
    var input = transaction.inputs[0];
    var roundtrip = new MultiSigInput(input.toObject());
    roundtrip.toObject().should.deep.equal(input.toObject());
  });
  // it('can parse list of signature buffers, from TX signed with key 1 and 2', function() {
  //   var transaction = new Transaction("a000000000000140c1ae9d6933e4a08594f814ba73a4e94d19c8a83f45784b1684b3a3f84ee6660000000000ffffffff010140420f000000000017a914105ad4d342fa48f96ec630ff6bae7209a2e4d79d8700");

  //   var inputObj = transaction.inputs[0].toObject();
  //   inputObj.output = output;
  //   console.log(inputObj.signatures)
  //   transaction.inputs[0] = new Transaction.Input(inputObj);

  //   inputObj.signatures = MultiSigInput.normalizeSignatures(
  //       transaction,
  //       transaction.inputs[0],
  //       0,
  //       transaction.inputs[0].script.chunks.slice(1).map(function(s) { return s.buf; }),
  //       [public1, public2, public3]
  //   );
  //   console.log(inputObj.signatures)

  //   transaction.inputs[0] = new MultiSigInput(inputObj, [public1, public2, public3], 2);

  //   transaction.inputs[0].signatures[0].publicKey.should.deep.equal(public1);
  //   transaction.inputs[0].signatures[1].publicKey.should.deep.equal(public2);
  //   should.equal(transaction.inputs[0].signatures[2], undefined);
  //   transaction.inputs[0].isValidSignature(transaction, transaction.inputs[0].signatures[0]).should.be.true;
  //   transaction.inputs[0].isValidSignature(transaction, transaction.inputs[0].signatures[1]).should.be.true;
  // });
  // it('can parse list of signature buffers, from TX signed with key 3 and 1', function() {
  //   var transaction = new Transaction("a000000000000140c1ae9d6933e4a08594f814ba73a4e94d19c8a83f45784b1684b3a3f84ee6660000000000ffffffff010140420f000000000017a914105ad4d342fa48f96ec630ff6bae7209a2e4d79d8700");

  //   var inputObj = transaction.inputs[0].toObject();
  //   inputObj.output = output;
  //   transaction.inputs[0] = new Transaction.Input(inputObj);

  //   inputObj.signatures = MultiSigInput.normalizeSignatures(
  //       transaction,
  //       transaction.inputs[0],
  //       0,
  //       transaction.inputs[0].script.chunks.slice(1).map(function(s) { return s.buf; }),
  //       [public1, public2, public3]
  //   );

  //   transaction.inputs[0] = new MultiSigInput(inputObj, [public1, public2, public3], 2);

  //   transaction.inputs[0].signatures[0].publicKey.should.deep.equal(public1);
  //   should.equal(transaction.inputs[0].signatures[1], undefined);
  //   transaction.inputs[0].signatures[2].publicKey.should.deep.equal(public3);
  //   transaction.inputs[0].isValidSignature(transaction, transaction.inputs[0].signatures[0]).should.be.true;
  //   transaction.inputs[0].isValidSignature(transaction, transaction.inputs[0].signatures[2]).should.be.true;
  // });
});
