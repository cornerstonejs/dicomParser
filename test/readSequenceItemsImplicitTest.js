(function(dicomParser) {
  module("dicomParser.readSequenceItemsImplicit");

  function convertToByteArray(bytes) {
    var byteArray = new Uint8Array(bytes.length);
    var i = 0;
    bytes.forEach(function(byte) { byteArray[i++] = byte; });
    return byteArray;
  }

  test("element that looks like SQ is properly parsed in an undefined-length item in an undefined-length sequence with provided callback", function(assert) {
    // Arrange
                 // (fffe,e000)              (undefined length)
    var bytes = [0xfe, 0xff, 0x00, 0xe0, 0xFF, 0xFF, 0xFF, 0xFF,
                 // (7fe0,0010)                               8
                 0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
                 // Looks like an item tag, but isn't since it's within pixel data
                 0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
                 // (fffe,e00d)                               0
                 0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00,
                 // (fffe,e0dd)                               0
                 0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00,
    ];
    var callback = function(tag) {
      return undefined; // nothing should be interpreted as an SQ
    };
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));
    var element = {length: 0xFFFFFFFF};

    // Act
    dicomParser.readSequenceItemsImplicit(byteStream, element, callback);

    // Assert
    assert.strictEqual(element.items.length, 1);
    var sequenceItem = element.items[0];
    assert.ok(sequenceItem);
    assert.strictEqual(sequenceItem.length, 24);
    var pixelData = sequenceItem.dataSet.elements['x7fe00010'];
    assert.ok(pixelData);
    assert.strictEqual(pixelData.length, 8);
    assert.ok(sequenceItem.dataSet.elements['xfffee00d']);
    assert.strictEqual(byteStream.warnings.length, 0);
  });

  test("missing item and sequence delimiters generate warnings", function(assert) {
    // Arrange
                 // (fffe,e000)              (undefined length)
    var bytes = [0xfe, 0xff, 0x00, 0xe0, 0xFF, 0xFF, 0xFF, 0xFF,
                // (7fe0,0010)                               4
                0xe0, 0x7f, 0x10, 0x00, 0x04, 0x00, 0x00, 0x00,
                0x01, 0x23, 0x45, 0x67,
    ];
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));
    var element = {length: 0xFFFFFFFF};

    // Act
    dicomParser.readSequenceItemsImplicit(byteStream, element);

    // Assert
    assert.strictEqual(element.items.length, 1);
    var sequenceItem = element.items[0];
    assert.ok(sequenceItem);
    assert.strictEqual(sequenceItem.length, 12);
    var pixelData = sequenceItem.dataSet.elements['x7fe00010'];
    assert.ok(pixelData);
    assert.strictEqual(pixelData.length, 4);
    assert.strictEqual(byteStream.warnings.length, 2);
    assert.ok(byteStream.warnings.some(function(warning) { return warning.indexOf('sequence item delimiter') > -1; }));
    assert.ok(byteStream.warnings.some(function(warning) { return warning.indexOf('sequence delimiter') > -1; }));
  });

  test("element that looks like SQ is properly parsed in an item with defined length in an undefined-length sequence with provided callback", function(assert) {
    // Arrange
                 // (fffe,e000)                              16
    var bytes = [0xfe, 0xff, 0x00, 0xe0, 0x10, 0x00, 0x00, 0x00,
                 // (7fe0,0010)                               8
                 0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
                 // Looks like an item tag, but isn't since it's within pixel data
                 0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
                 // (fffe,e0dd)                               0
                 0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00,
    ];
    var callback = function(tag) {
      return undefined; // nothing should be interpreted as an SQ
    };
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));
    var element = {length: 0xFFFFFFFF};

    // Act
    dicomParser.readSequenceItemsImplicit(byteStream, element, callback);

    // Assert
    assert.strictEqual(element.items.length, 1);
    var sequenceItem = element.items[0];
    assert.ok(sequenceItem);
    assert.strictEqual(sequenceItem.length, 16);
    var pixelData = sequenceItem.dataSet.elements['x7fe00010'];
    assert.ok(pixelData);
    assert.strictEqual(pixelData.length, 8);
    assert.strictEqual(byteStream.warnings.length, 0);
  });

  test("element that looks like SQ is properly parsed in an item with defined length in a defined-length sequence with provided callback", function(assert) {
    // Arrange
                 // (fffe,e000)                              16
    var bytes = [0xfe, 0xff, 0x00, 0xe0, 0x10, 0x00, 0x00, 0x00,
                 // (7fe0,0010)                               8
                 0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
                 // Looks like an item tag, but isn't since it's within pixel data
                 0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    var callback = function(tag) {
      return undefined; // nothing should be interpreted as an SQ
    };
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));
    var element = {dataOffset: 0, length: 24};

    // Act
    dicomParser.readSequenceItemsImplicit(byteStream, element, callback);

    // Assert
    assert.strictEqual(element.items.length, 1);
    var sequenceItem = element.items[0];
    assert.ok(sequenceItem);
    assert.strictEqual(sequenceItem.length, 16);
    var pixelData = sequenceItem.dataSet.elements['x7fe00010'];
    assert.ok(pixelData);
    assert.strictEqual(pixelData.length, 8);
    assert.strictEqual(byteStream.warnings.length, 0);
  });

  test("malformed tag at end of stream doesn't crash", function(assert) {
    // Arrange
    var bytes = new Uint8Array(1);
    var element = {length: 0xFFFFFFFF};
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, bytes);

    // Act
    dicomParser.readSequenceItemsImplicit(byteStream, element);

    // Assert
    assert.strictEqual(byteStream.warnings.length, 1);
  });

  test("no byteStream throws", function(assert) {
    // Assert
    assert.throws(function() { dicomParser.readSequenceItemsImplicit(undefined, {length: 0xFFFFFFFF}); }, /required parameter 'byteStream'/);
  });

  test("no element throws", function(assert) {
    // Arrange
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, new Uint8Array(1));

    // Assert
    assert.throws(function() { dicomParser.readSequenceItemsImplicit(byteStream); }, /required parameter 'element'/);
  });

})(dicomParser);