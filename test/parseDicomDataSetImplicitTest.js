
(function(dicomParser) {
    module("dicomParser.parseDicomDataSetImplicit");

    function convertToByteArray(bytes) {
        var byteArray = new Uint8Array(bytes.length);
        var i = 0;
        bytes.forEach(function(byte) { byteArray[i++] = byte; });
        return byteArray;
    }

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
        var byteArray = convertToByteArray(bytes);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});

        // Act
        dicomParser.parseDicomDataSetImplicit(dataSet, byteStream, byteStream.byteArray.length, {vrCallback: callback});

        // Assert
        var element = dataSet.elements['x7fe00010'];
        assert.ok(element);
        assert.strictEqual(element.items, undefined);
        assert.strictEqual(element.length, 8);
    });

})(dicomParser);