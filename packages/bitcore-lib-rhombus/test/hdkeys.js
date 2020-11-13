'use strict';

// Relax some linter options:
//   * quote marks so "m/0'/1/2'/" doesn't need to be scaped
//   * too many tests, maxstatements -> 100
//   * store test vectors at the end, latedef: false
//   * should call is never defined
/* jshint quotmark: false */
/* jshint latedef: false */
/* jshint maxstatements: 100 */
/* jshint unused: false */

var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var bitcore = require('..');
var Networks = bitcore.Networks;
var HDPrivateKey = bitcore.HDPrivateKey;
var HDPublicKey = bitcore.HDPublicKey;

describe('HDKeys building with static methods', function() {
  var classes = [HDPublicKey, HDPrivateKey];
  var clazz, index;

  _.each(classes, function(clazz) {
    var expectStaticMethodFail = function(staticMethod, argument, message) {
      expect(clazz[staticMethod].bind(null, argument)).to.throw(message);
    };
    it(clazz.name + ' fromJSON checks that a valid JSON is provided', function() {
      var errorMessage = 'Invalid Argument: No valid argument was provided';
      var method = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, 'invalid JSON', errorMessage);
      expectStaticMethodFail(method, '{\'singlequotes\': true}', errorMessage);
    });
    it(clazz.name + ' fromString checks that a string is provided', function() {
      var errorMessage = 'No valid string was provided';
      var method = 'fromString';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, {}, errorMessage);
    });
    it(clazz.name + ' fromObject checks that an object is provided', function() {
      var errorMessage = 'No valid argument was provided';
      var method = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, '', errorMessage);
    });
  });
});

describe('BIP32 compliance', function() {

  it('should initialize test vector 1 from the extended public key', function() {
    new HDPublicKey(vector1_m_public).xpubkey.should.equal(vector1_m_public);
  });

  it('should initialize test vector 1 from the extended private key', function() {
    new HDPrivateKey(vector1_m_private).xprivkey.should.equal(vector1_m_private);
  });

  it('can initialize a public key from an extended private key', function() {
    new HDPublicKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it('toString should be equal to the `xpubkey` member', function() {
    var privateKey = new HDPrivateKey(vector1_m_private);
    privateKey.toString().should.equal(privateKey.xprivkey);
  });

  it('toString should be equal to the `xpubkey` member', function() {
    var publicKey = new HDPublicKey(vector1_m_public);
    publicKey.toString().should.equal(publicKey.xpubkey);
  });

  it('should get the extended public key from the extended private key for test vector 1', function() {
    HDPrivateKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it("should get m/0' ext. private key from test vector 1", function() {
    var privateKey = new HDPrivateKey(vector1_m_private).derive("m/0'");
    privateKey.xprivkey.should.equal(vector1_m0h_private);
  });

  it("should get m/0' ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'")
      .xpubkey.should.equal(vector1_m0h_public);
  });

  it("should get m/0'/1 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1")
      .xprivkey.should.equal(vector1_m0h1_private);
  });

  it("should get m/0'/1 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1")
      .xpubkey.should.equal(vector1_m0h1_public);
  });

  it("should get m/0'/1 ext. public key from m/0' public key from test vector 1", function() {
    var derivedPublic = HDPrivateKey(vector1_m_private).derive("m/0'").hdPublicKey.derive("m/1");
    derivedPublic.xpubkey.should.equal(vector1_m0h1_public);
  });

  it("should get m/0'/1/2' ext. private key from test vector 1", function() {
    var privateKey = new HDPrivateKey(vector1_m_private);
    var derived = privateKey.derive("m/0'/1/2'");
    derived.xprivkey.should.equal(vector1_m0h12h_private);
  });

  it("should get m/0'/1/2' ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1/2'")
      .xpubkey.should.equal(vector1_m0h12h_public);
  });

  it("should get m/0'/1/2'/2 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2")
      .xprivkey.should.equal(vector1_m0h12h2_private);
  });

  it("should get m/0'/1/2'/2 ext. public key from m/0'/1/2' public key from test vector 1", function() {
    var derived = HDPrivateKey(vector1_m_private).derive("m/0'/1/2'").hdPublicKey;
    derived.derive("m/2").xpubkey.should.equal(vector1_m0h12h2_public);
  });

  it("should get m/0'/1/2h/2 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2")
      .xpubkey.should.equal(vector1_m0h12h2_public);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2/1000000000")
      .xprivkey.should.equal(vector1_m0h12h21000000000_private);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2/1000000000")
      .xpubkey.should.equal(vector1_m0h12h21000000000_public);
  });

  it("should get m/0'/1/2'/2/1000000000 ext. public key from m/0'/1/2'/2 public key from test vector 1", function() {
    var derived = HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2").hdPublicKey;
    derived.derive("m/1000000000").xpubkey.should.equal(vector1_m0h12h21000000000_public);
  });

  it('should initialize test vector 2 from the extended public key', function() {
    HDPublicKey(vector2_m_public).xpubkey.should.equal(vector2_m_public);
  });

  it('should initialize test vector 2 from the extended private key', function() {
    HDPrivateKey(vector2_m_private).xprivkey.should.equal(vector2_m_private);
  });

  it('should get the extended public key from the extended private key for test vector 2', function() {
    HDPrivateKey(vector2_m_private).xpubkey.should.equal(vector2_m_public);
  });

  it("should get m/0 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive(0).xprivkey.should.equal(vector2_m0_private);
  });

  it("should get m/0 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive(0).xpubkey.should.equal(vector2_m0_public);
  });

  it("should get m/0 ext. public key from m public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).hdPublicKey.derive(0).xpubkey.should.equal(vector2_m0_public);
  });

  it("should get m/0/2147483647h ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'")
      .xprivkey.should.equal(vector2_m02147483647h_private);
  });

  it("should get m/0/2147483647h ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'")
      .xpubkey.should.equal(vector2_m02147483647h_public);
  });

  it("should get m/0/2147483647h/1 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1")
      .xprivkey.should.equal(vector2_m02147483647h1_private);
  });

  it("should get m/0/2147483647h/1 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1")
      .xpubkey.should.equal(vector2_m02147483647h1_public);
  });

  it("should get m/0/2147483647h/1 ext. public key from m/0/2147483647h public key from test vector 2", function() {
    var derived = HDPrivateKey(vector2_m_private).derive("m/0/2147483647'").hdPublicKey;
    derived.derive(1).xpubkey.should.equal(vector2_m02147483647h1_public);
  });

  it("should get m/0/2147483647h/1/2147483646h ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1/2147483646'")
      .xprivkey.should.equal(vector2_m02147483647h12147483646h_private);
  });

  it("should get m/0/2147483647h/1/2147483646h ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1/2147483646'")
      .xpubkey.should.equal(vector2_m02147483647h12147483646h_public);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1/2147483646'/2")
      .xprivkey.should.equal(vector2_m02147483647h12147483646h2_private);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/0/2147483647'/1/2147483646'/2")
      .xpubkey.should.equal(vector2_m02147483647h12147483646h2_public);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. public key from m/0/2147483647h/2147483646h public key from test vector 2", function() {
    var derivedPublic = HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1/2147483646'").hdPublicKey;
    derivedPublic.derive("m/2")
      .xpubkey.should.equal(vector2_m02147483647h12147483646h2_public);
  });

  it('should use full 32 bytes for private key data that is hashed (as per bip32)', function() {
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.deriveChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb');
  });

  it('should NOT use full 32 bytes for private key data that is hashed with nonCompliant flag', function() {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.deriveNonCompliantChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836');
  });

  it('should NOT use full 32 bytes for private key data that is hashed with the nonCompliant derive method', function() {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.derive("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836');
  });

  describe('edge cases', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will handle edge case that derived private key is invalid', function() {
      var invalid = new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
      var privateKeyBuffer = new Buffer('5f72914c48581fc7ddeb944a9616389200a9560177d24f458258e5b04527bcd1', 'hex');
      var chainCodeBuffer = new Buffer('39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91', 'hex');
      var unstubbed = bitcore.crypto.BN.prototype.toBuffer;
      var count = 0;
      var stub = sandbox.stub(bitcore.crypto.BN.prototype, 'toBuffer').callsFake(function (args) {
        // On the fourth call to the function give back an invalid private key
        // otherwise use the normal behavior.
        count++;
        if (count === 4) {
          return invalid;
        }
        var ret = unstubbed.apply(this, arguments);
        return ret;
      });
      sandbox.spy(bitcore.PrivateKey, 'isValid');
      var key = HDPrivateKey.fromObject({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        privateKey: privateKeyBuffer,
        chainCode: chainCodeBuffer
      });
      var derived = key.derive("m/44'");
      derived.privateKey.toString().should.equal('b15bce3608d607ee3a49069197732c656bca942ee59f3e29b4d56914c1de6825');
      bitcore.PrivateKey.isValid.callCount.should.equal(2);
    });
    it('will handle edge case that a derive public key is invalid', function() {
      var publicKeyBuffer = new Buffer('029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099', 'hex');
      var chainCodeBuffer = new Buffer('39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91', 'hex');
      var key = new HDPublicKey({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        chainCode: chainCodeBuffer,
        publicKey: publicKeyBuffer
      });
      var unstubbed = bitcore.PublicKey.fromPoint;
      bitcore.PublicKey.fromPoint = function() {
        bitcore.PublicKey.fromPoint = unstubbed;
        throw new Error('Point cannot be equal to Infinity');
      };
      sandbox.spy(key, '_deriveWithNumber');
      var derived = key.derive("m/44");
      key._deriveWithNumber.callCount.should.equal(2);
      key.publicKey.toString().should.equal('029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099');
    });
  });

  describe('seed', function() {

    it('should initialize a new BIP32 correctly from test vector 1 seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector1_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector1_m_private);
      seededKey.xpubkey.should.equal(vector1_m_public);
    });

    it('should initialize a new BIP32 correctly from test vector 2 seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector2_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector2_m_private);
      seededKey.xpubkey.should.equal(vector2_m_public);
    });
  });
});

//test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
var vector1_master = '000102030405060708090a0b0c0d0e0f';
var vector1_m_public = 'PPARTKMMf4AUDYzRSCijXD2q3gcT5KwjATBsPXMEDbu2Vi6GvpMD8AjJiEQobuJwbqNxDRjCS2ar17bCGBB6Zucp8o3N6SQ4vzdam6gaSyhErU4U';
var vector1_m_private = 'XPARHAr37YxmFP8wykrnN4tBUuFyfYbnB6gLntLsPbLpN8qfbAbkmz5nZRqEWcJc2SHY2VRzoo3Tg4X8epvmq4odD6HLvP4UjAje1SSr7C7Y6HXx';
var vector1_m0h_public = 'PPARTKPd53smgeFYRMKsEQnhgZeZBemHWqGMQCxf7ZzQcgHUDBdWJaxqoMZA1gaWJagrkRwUztpPRrEGM9a4hreYWrvppe2sBuwUycci1HQ7x3vN';
var vector1_m0h_private = 'XPARHAtJXYg4iUQ4xuTv5Ge47nJ5msRLXUkpoZxJHZSCV72rsXt3xQKKeYyavPZxMqzuzCUtWALnYSsyXYgoYiPuPtMRSSw9sQhLu9TUxdJxX8f6';
var vector1_m0h1_public = 'PPARTKRoCFfKa2xRVBmug93bZAPSqi9GcqJ5h9HKxAGBRcvGRRB1SJmG7K84F6exszda6Pf73gEqXxpkpjsoXKyiQYaekwEi3PaVFFMEnaHGuhY6';
var vector1_m0h1_private = 'XPARHAvUekTcbs6x2juxWztwzP2yRvoKdUnZ6WGy89hyJ3ff5mRZ687jxWYV9od9RSvh2eZeByANyXavwgdKmqjhNfWusxi7bUT7kpFoLAEK5JMq';
var vector1_m0h12h_public = 'PPARTKUQUJC9RjqGu3whmPdzvXPUywJ996qfgUpZdQbUanndrq2CZ7X6YDZcAeg9iSW1QkBCnHcp9LmKoCCwp35Fwc2obX8gBUXYvy39vfZyjuCg';
var vector1_m0h12h_private = 'XPARHAy5vnzSTZyoSc5kcFVMMk31a9xC9kL95qpCoQ3GTDY2XBGkCvsaPQz35MfN3RACXA2faZdKtwzkquq4XRkcZncMYKKg9dPMhRXYYnpG9F4R';
var vector1_m0h12h2_public = 'PPARTKWds8dGNvJwt8RBV5uD1QteJ27RsjRysvJSvfZ147ECUC7pvBHnuR956L196rJA9DVKxRdJ6PWDukdHp8Nh9KdGrRvENJiSkyj4mpAghRTg';
var vector1_m0h12h2_private = 'XPARHB1KKdRZQkTURgZEKwkZSdYAtEmUtNvTHHJ66eznvXyb8YNNZzeGkcZW12ymVspbxDpoHBYZTrpD1P1xydB9uyzwaiZmFBUBQaW1iJEhoWbQ';
var vector1_m0h12h21000000000_public = 'PPARTKYMdcJsd3SL5ekxwCSmjibeHpM1BYvnuiYqUuqPCKJaxuFEJhi3ZgFE9xq43hZErhBcVvyDtvhvWM3gqEEBzAtRyJTeT7C2Pnggh4LwtqoA';
var vector1_m0h12h21000000000_private = 'XPARHB33677AesardCu1n4J8AwFAt314CCRGK5YUeuHB4k3ydFVmxX4XQsff4fqYhnjj2qECXxuYQhrk8PByMAFAe6xb844XUJNw7rqa53Pi4eQg';
var vector2_master = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
var vector2_m_public = 'PPARTKMMf4AUDYzRSCLErKBuL8pAqa8sb8p8DCw1wtqmKgUPo7LEKLt5efJyCFR2aYdKBLHSDwFWAWfhWtxpo2ojHvxN3JLGPq85RR4FZFfwSWHQ';
var vector2_m_private = 'XPARHAr37YxmFP8wykUHhB3FmMThRnnvbnJbcZvf7tHZC7DnTTamyAEZVrjQ6xNP5co67jUkEYKv8LdAqvTVw7E1uhefgqUYyK5Yk1hULZ65k6Dp';
var vector2_m0_public = 'PPARTKQdQKtAB31FWibq9SyHDCcaMw6cqqncVm6mK4enmktFkoJgHv9Rip9YSpszULiKcYbvPoUVuukYV48FUuxRiGZ2KaP14jUDoYYNDgsBefuk';
var vector2_m0_private = 'XPARHAuJrpgTCs9n4GjszJpdeRG6x9kfrVH5u86QV46aeBdeR9ZDwjVua1ZyMXsetFrvx98z4SLKrmnayGy8kfWWxdsq5qey2hZiV97NtvLUxQeP';
var vector2_m02147483647h_public = 'PPARTKRnTaVBhQuRctU3KsRGrfxFvKqqkPGnBrFqqz3hYQd29FbukY2r32DL3SGEb6SviL7qwTKMXCxy5io7pgrupzhUx7Td86CUpQvdpXbRBaXT';
var vector2_m02147483647h_private = 'XPARHAvTv5HUjF3xASc6AjGdHtbnWYVtm2mFbDFV1yVVQqNQobrTQMPKtDdkx9E8rz7fS3NJxDMXVpo65iCsXPt86DBGeGPCNU5SjvtiRgjV3aym';
var vector2_m02147483647h1_public = 'PPARTKUbRzWAdaYioz5iTw5RRduC9fNiFVThTAhLhq7MsiWNavRmuqYNjv7iRH4RitKczvJJVHxSkr6GuobNqbmLnG2wrhjpyJjv2LhJmn53fSDC';
var vector2_m02147483647h1_private = 'XPARHAyGtVJTfQhFMYDmJnvmrrYijt2mG8xArXgyspZ9k9FmFGgKZetrb7Y9Kz2LV1ps8MKfexebtELmJ2uegSmeUDf5wQ9jBKBR8Qh9AAP4eG4E';
var vector2_m02147483647h12147483646h_public = 'PPARTKVmTuU6zBwgXH2x4fZEy1QtLa7BcYSKxCQ4bMq4HZGdqNn6qwDJkSe5WuiZE5h9Ssjx86TWTthbmTEYEHeTHyPeJye9Ts31SCvPMK2wwixe';
var vector2_m02147483647h12147483646h_private = 'XPARHAzSvQGQ226D4qAzuXQbQE4QvnmEdBvoMZPhmMGr9z22Vj2eVkZnbe4WRcj4seFFQttxMGUNsciLsr2k3xiYxuVm7E6GVTPSkkH9gE9T3hqH';
var vector2_m02147483647h12147483646h2_public = 'PPARTKX8VruKVi7zm2J8xPdNezAGJyAiinmF2rZgUmcQnC4VRSySR6rEWdD2Wz7dWDGW9PoAMNP1snQckwfbj7k9CHeVtcoyYoQJAtDaXyh2twFh';
var vector2_m02147483647h12147483646h2_private = 'XPARHB1oxMhcXYGXJaSBoFUj6ConuBpmjSFiSDZKem4Cecot5oDz4vCiMpdTRh8jsoGLUwCp5ZE1h4pBZtadZh2vBxUVq2wmzWoaUSeVEJjizfsx';
