(function(dicomParser) {
  module("dicomParser.readSequenceItemsExplicit");

  test("malformed tag at end of stream doesn't crash", function(assert) {
    // Arrange
    var bytes = new Uint8Array(1);
    var element = {length: 0xFFFFFFFF};
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, bytes);
    var warnings = [];

    // Act
    dicomParser.readSequenceItemsExplicit(byteStream, element, warnings);

    // Assert
    assert.strictEqual(warnings.length, 1);
  });

})(dicomParser);