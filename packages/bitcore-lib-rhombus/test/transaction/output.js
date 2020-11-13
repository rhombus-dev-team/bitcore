"use strict";

/* jshint unused: false */
/* jshint latedef: false */
var should = require("chai").should();
var expect = require("chai").expect;
var _ = require("lodash");

var bitcore = require("../..");
var BN = bitcore.crypto.BN;
var BufferWriter = bitcore.encoding.BufferWriter;
var BufferReader = bitcore.encoding.BufferReader;
var Output = bitcore.Transaction.Output;
var Script = bitcore.Script;

var errors = bitcore.errors;

describe("Output", function() {
  var output = new Output({
    satoshis: 0,
    script: Script.empty()
  });

  it("throws error with unrecognized argument", function() {
    (function() {
      var out = new Output(12345);
    }.should.throw(TypeError));
  });

  it("can be assigned a satoshi amount in big number", function() {
    var newOutput = new Output({
      satoshis: new BN(100),
      script: Script.empty()
    });
    newOutput.satoshis.should.equal(100);
  });

  it("can be assigned a satoshi amount with a string", function() {
    var newOutput = new Output({
      satoshis: "100",
      script: Script.empty()
    });
    newOutput.satoshis.should.equal(100);
  });

  describe("will error if output is not a positive integer", function() {
    it("-100", function() {
      (function() {
        var newOutput = new Output({
          satoshis: -100,
          script: Script.empty()
        });
      }.should.throw("Output satoshis is not a natural number"));
    });

    it("1.1", function() {
      (function() {
        var newOutput = new Output({
          satoshis: 1.1,
          script: Script.empty()
        });
      }.should.throw("Output satoshis is not a natural number"));
    });

    it("NaN", function() {
      (function() {
        var newOutput = new Output({
          satoshis: NaN,
          script: Script.empty()
        });
      }.should.throw("Output satoshis is not a natural number"));
    });

    it("Infinity", function() {
      (function() {
        var newOutput = new Output({
          satoshis: Infinity,
          script: Script.empty()
        });
      }.should.throw("Output satoshis is not a natural number"));
    });
  });

  var expectEqualOutputs = function(a, b) {
    a.satoshis.should.equal(b.satoshis);
    a.script.toString().should.equal(b.script.toString());
  };

  it("deserializes correctly a simple output", function() {
    var writer = new BufferWriter();
    output.toBufferWriter(writer);
    var deserialized = Output.fromBufferReader(
      new BufferReader(writer.toBuffer())
    );
    expectEqualOutputs(output, deserialized);
  });

  it("can instantiate from an object", function() {
    var out = new Output(output.toObject());
    should.exist(out);
  });

  it("can set a script from a buffer", function() {
    var newOutput = new Output(output.toObject());
    newOutput.setScript(Script().add(0).toBuffer());
    newOutput.inspect().should.equal("<Output (0 sats) <Script: OP_0>>");
  });

  it("has a inspect property", function() {
    output.inspect().should.equal("<Output (0 sats) <Script: >>");
  });

  var output2 = new Output({
    type: 1,
    satoshis: 1100000000,
    script: new Script(
      "OP_HASH160 20 0x89ca93e03119d53fd9ad1e65ce22b6f8791f8a49 OP_EQUAL"
    )
  });

  it("toBufferWriter", function() {
    output2
      .toBufferWriter()
      .toBuffer()
      .toString("hex")
      .should.equal(
        "0100ab90410000000017a91489ca93e03119d53fd9ad1e65ce22b6f8791f8a4987"
      );
  });

  it("roundtrips to/from object", function() {
    var newOutput = new Output({
      type: 1,
      satoshis: 50,
      script: new Script().add(0)
    });
    var otherOutput = new Output(newOutput.toObject());
    expectEqualOutputs(newOutput, otherOutput);
  });

  it("#toObject roundtrip will handle an invalid (null) script", function() {
    var invalidOutputScript = new Buffer("010100000000000000014c", "hex");
    var br = new bitcore.encoding.BufferReader(invalidOutputScript);
    var output = Output.fromBufferReader(br);
    var output2 = new Output(output.toObject());
    should.equal(output2.script, null);
    should.equal(output2._scriptBuffer.toString("hex"), "4c");
  });

  it("inspect will work with an invalid (null) script", function() {
    var invalidOutputScript = new Buffer("010100000000000000014c", "hex");
    var br = new bitcore.encoding.BufferReader(invalidOutputScript);
    var output = Output.fromBufferReader(br);
    output.inspect().should.equal("<Output (1 sats) 4c>");
  });

  it("roundtrips to/from JSON", function() {
    var json = JSON.stringify(output2);
    var o3 = new Output(JSON.parse(json));
    JSON.stringify(o3).should.equal(json);
  });

  it("setScript fails with invalid input", function() {
    var out = new Output(output2.toJSON());
    out.setScript.bind(out, 45).should.throw("Invalid argument type: script");
  });

  it("sets script to null if it is an InvalidBuffer", function() {
    var output = new Output({
      satoshis: 1000,
      script: new Buffer("4c", "hex")
    });
    should.equal(output.script, null);
  });
});
