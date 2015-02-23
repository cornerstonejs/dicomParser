
(function(dicomParser) {
    module("dicomParser.readDicomElementExplicit");

    test("returns element", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        ok(element, "no element returned");
    });

    test("parsed tag is correct", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        equal(element.tag, "x22114433",  "tag not correct");
    });

    test("parsed vr is correct", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        byteArray[4] = 0x53; // ST
        byteArray[5] = 0x54;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        equal(element.vr, "ST",  "tag not correct");
    });

    test("parse element for 2 byte length is correct", function() {
        // Arrange
        var byteArray = new Uint8Array(1024);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        byteArray[4] = 0x53; // ST
        byteArray[5] = 0x54;
        byteArray[6] = 0x01; // length of 513
        byteArray[7] = 0x02;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        equal(element.length, 513,  "length is not correct");
    });

    test("parse element for 4 byte length is correct", function() {
        // Arrange
        var byteArray = new Uint8Array(16909060 + 12);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        byteArray[4] = 0x4F; // OB
        byteArray[5] = 0x42;
        byteArray[6] = 0x00;
        byteArray[7] = 0x00;
        byteArray[8] = 0x04; // 4    overall length = 16909060 = (16777216 + 131072 + 768 + 4)
        byteArray[9] = 0x03; // 768
        byteArray[10] = 0x02; // 131072
        byteArray[11] = 0x01; // 16777216
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        equal(element.length, 16909060,  "length is not correct");
    });

    test("parse element has correct data offset", function() {
        // Arrange
        var byteArray = new Uint8Array(16909060 + 12);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        byteArray[4] = 0x4F; // OB
        byteArray[5] = 0x42;
        byteArray[6] = 0x00;
        byteArray[7] = 0x00;
        byteArray[8] = 0x04; // 4    overall length = 16909060 = (16777216 + 131072 + 768 + 4)
        byteArray[9] = 0x03; // 768
        byteArray[10] = 0x02; // 131072
        byteArray[11] = 0x01; // 16777216
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var element = dicomParser.readDicomElementExplicit(byteStream);

        // Assert
        equal(element.dataOffset, 12,  "dataOffset is not correct");
    });

    module("dicomParser.readDicomElementImplicit");

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

    test("truncated element defined length returns", function() {
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
        ok(element, "no element returned");
    });

    test("truncated element undefined length returns", function() {
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
        ok(element, "no element returned");
    });

})(dicomParser);