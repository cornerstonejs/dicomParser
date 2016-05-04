(function(dicomParser) {
  module("dicomParser.readDicomElementImplicit");

  function convertToByteArray(bytes) {
    var byteArray = new Uint8Array(bytes.length);
    var i = 0;
    bytes.forEach(function(byte) { byteArray[i++] = byte; });
    return byteArray;
  }

  test("returns element", function() {
    // Arrange
    var byteArray = new Uint8Array(8);
    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0x00;
    byteArray[5] = 0x00;
    byteArray[6] = 0x00;
    byteArray[7] = 0x00;
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream);

    // Assert
    ok(element, "no element returned");
  });

  test("truncated element defined length returns", function(assert) {
    // Arrange
    var byteArray = new Uint8Array(8);
    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0x00;
    byteArray[5] = 0xFF;
    byteArray[6] = 0xFF;
    byteArray[7] = 0xFF;
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream);

    // Assert
    assert.ok(element, "no element returned");
    assert.strictEqual(byteStream.warnings.length, 1);
  });

  test("truncated element undefined length returns", function(assert) {
    // Arrange
    var byteArray = new Uint8Array(8);
    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0xFF;
    byteArray[5] = 0xFF;
    byteArray[6] = 0xFF;
    byteArray[7] = 0xFF;
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream);

    // Assert
    assert.ok(element, "no element returned");
    assert.strictEqual(byteStream.warnings.length, 1);
  });

  test("item tag successfully defines implicit SQ without callback (using peeking)", function(assert) {
    // Arrange
    // (0008,0006)                              18
    var bytes = [0x08, 0x00, 0x06, 0x00, 0x12, 0x00, 0x00, 0x00,
      // (fffe,e000)                              10
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      // (0008,0100)                               2   "A"
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream, undefined);

    // Assert
    var itemStart = element.items[0];
    assert.strictEqual(element.items.length, 1);
    assert.strictEqual(itemStart.tag, 'xfffee000');
    var codeValue = itemStart.dataSet.elements['x00080100'];
    assert.ok(codeValue);
    assert.strictEqual(codeValue.length, 2);
    assert.strictEqual(codeValue.dataOffset, 24);
  });

  test("implicit zero-length sequence with undefined length parses successfully without callback (using peeking)", function(assert) {
    // Arrange
    // (0008,0006)               (undefined length)
    var bytes = [0x08, 0x00, 0x06, 0x00, 0xFF, 0xFF, 0xFF, 0xFF,
      // (fffe,e0dd)                               0
      0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00,
      // (0008,0100)                               2   "A"
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream);

    // Assert
    assert.strictEqual(element.tag, 'x00080006');
    assert.deepEqual(element.items, []);
  });

  test("bytes resembling an item tag look like an implicit SQ item when not using a callback", function(assert) {
    // Arrange
    // (7fe0,0010)                               8
    var bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
      // Looks like an item tag, but isn't since it's within pixel data
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act/Assert
    assert.throws(function() { dicomParser.readDicomElementImplicit(byteStream, undefined); }, /invalid value for parameter 'maxPosition'/);
  });

  test("bytes resembling an item tag are not treated like an SQ item when using a callback", function(assert) {
    // Arrange
    // (7fe0,0010)                               8
    var bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
      // Looks like an item tag, but isn't since it's within pixel data
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    var callback = function(tag) {
      return undefined; // nothing should be interpreted as an SQ
    };
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream, undefined, callback);

    // Assert
    assert.strictEqual(element.tag, 'x7fe00010');
    assert.strictEqual(element.items, undefined);
    assert.strictEqual(element.length, 8);
  });

  test("bytes resembling an end-of-sequence tag look like an implicit SQ item when not using a callback", function(assert) {
    // Arrange
    // (7fe0,0010)                                           11
    var bytes = [0xe0, 0x7f, 0x10, 0x00, 0x0B, 0x00, 0x00, 0x00,
      // Looks like a sequence delimiter tag, but isn't since it's within pixel data
      0xfe, 0xff, 0xdd, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      0x12, 0x43, 0x98,
    ];
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act/Assert
    assert.throws(function() { dicomParser.readDicomElementImplicit(byteStream, undefined); }, /invalid value for parameter 'maxPosition'/);

  });

  test("bytes resembling an end-of-sequence tag are not treated like an SQ item when using a callback", function(assert) {
    // Arrange
    // (7fe0,0010)                              11
    var bytes = [0xe0, 0x7f, 0x10, 0x00, 0x0B, 0x00, 0x00, 0x00,
      // Looks like a sequence delimiter tag, but isn't since it's within pixel data
      0xfe, 0xff, 0xdd, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      0x12, 0x43, 0x98,
    ];
    var callback = function(tag) {
      return undefined; // nothing should be interpreted as an SQ
    };
    var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    var element = dicomParser.readDicomElementImplicit(byteStream, undefined, callback);

    // Assert
    assert.strictEqual(element.tag, 'x7fe00010');
    assert.strictEqual(element.items, undefined);
    assert.strictEqual(element.length, 11);
  });

})(dicomParser);