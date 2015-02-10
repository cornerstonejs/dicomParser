
(function(dicomParser) {
    module("dicomParser.bigEndianByteArrayParser");

    test("readUint16", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0xff;
        byteArray[1] = 0x80;

        // Act
        var uint16 = dicomParser.bigEndianByteArrayParser.readUint16(byteArray, 0);

        // Assert
        equal(uint16, 0xff80, "readUint16 did not return expected value");
    });

    test("readUint16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.bigEndianByteArrayParser.readUint16(byteArray, 31);
            },
            "readUint16 did not throw on buffer overread"
        )
    });

    test("readUint16 throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.bigEndianByteArrayParser.readUint16(byteArray, -1);
            },
            "readUint16 did not throw on buffer overread"
        )
    });

    test("readInt16 can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        byteArray[0] = 0xC9;
        byteArray[1] = 0x3A

        // Act
        var int16 = dicomParser.bigEndianByteArrayParser.readInt16(byteArray, 0);

        // Assert
        equal(int16, -14022, "readInt16 did not return expected value");
    });

    test("readInt16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(6);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.bigEndianByteArrayParser.readInt16(byteArray, 5);
            },
            "readUint16 did not throw on buffer overread"
        )
    });

    test("readInt16 throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(2);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.bigEndianByteArrayParser.readInt16(byteArray, -1);
            },
            "readInt16 did not throw on buffer overread"
        )
    });

    test("readUint32", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;

        // Act
        var uint32 = dicomParser.bigEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        equal(uint32, 0x11223344, "readUint32 did not return expected value");
    });

    test("readUint32", function() {
        // Arrange
        var byteArray = new Uint8Array(4);
        byteArray[0] = 0xFF;
        byteArray[1] = 0xFF;
        byteArray[2] = 0xFF;
        byteArray[3] = 0xFF;

        // Act
        var uint32 = dicomParser.bigEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        equal(uint32, 4294967295, "readUint32 did not return expected value");
    });

    test("readUint32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint32 = dicomParser.bigEndianByteArrayParser.readUint32(byteArray, 29);
            },
            "readUint32 did not throw on buffer overread"
        )
    });

    test("readUint32 throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint32 = dicomParser.bigEndianByteArrayParser.readUint32(byteArray, -1);
            },
            "readUint32 did not throw on buffer overread"
        )
    });

    test("readInt32 can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        byteArray[0] = 0xFE;
        byteArray[1] = 0xDC
        byteArray[2] = 0xBA
        byteArray[3] = 0x98

        // Act
        var int32 = dicomParser.bigEndianByteArrayParser.readInt32(byteArray, 0);

        // Assert
        equal(int32, -19088744, "readInt32 did not return expected value");
    });

    test("readInt32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var int32 = dicomParser.bigEndianByteArrayParser.readInt32(byteArray, 29);
            },
            "readInt32 did not throw on buffer overread"
        )
    });

    test("readInt32 throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var int32 = dicomParser.bigEndianByteArrayParser.readInt32(byteArray, -1);
            },
            "readInt32 did not throw on buffer overread"
        )
    });

    test("readFloat works on first value", function() {
        // Arrange
        var byteArray = new Uint8Array(4);
        byteArray[0] = 0xC7;
        byteArray[1] = 0x80;
        byteArray[2] = 0x01;
        byteArray[3] = 0x04;

        // Act
        var float = dicomParser.bigEndianByteArrayParser.readFloat(byteArray, 0);

        // Assert
        equal(float, -65538.03125, "readFloat did not return expected value");
    });

    test("readFloat works on second value", function() {
        // Arrange
        var byteArray = new Uint8Array(8);
        byteArray[0] = 0xFF;
        byteArray[1] = 0xAC;
        byteArray[2] = 0xB4;
        byteArray[3] = 0xC0;
        byteArray[4] = 0xC7;
        byteArray[5] = 0x80;
        byteArray[6] = 0x01;
        byteArray[7] = 0x04;

        // Act
        var float = dicomParser.bigEndianByteArrayParser.readFloat(byteArray, 4);

        // Assert
        equal(float, -65538.03125, "readFloat did not return expected value");
    });

    test("readFloat throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var float = dicomParser.bigEndianByteArrayParser.readFloat(byteArray, 29);
            },
            "readFloat did not throw on buffer overread"
        )
    });

    test("readFloat throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var float = dicomParser.bigEndianByteArrayParser.readFloat(byteArray, -1);
            },
            "readFloat did not throw on buffer overread"
        )
    });

    /* commented out since qunit doesn't seem to have Float64Array type - works ok in chrome though
    test("readDouble works on first value", function() {
        // Arrange
        var byteArray = new Uint8Array(8);
        byteArray[0] = 0xCE;
        byteArray[1] = 0x98;
        byteArray[2] = 0xAB;
        byteArray[3] = 0x12;
        byteArray[4] = 0x04;
        byteArray[5] = 0x87;
        byteArray[6] = 0x56;
        byteArray[7] = 0xFA;

        // Act
        var doubleValue = dicomParser.bigEndianByteArrayParser.readDouble(byteArray, 0);

        // Assert
        equal(doubleValue, -4.256349017182337e+70, "readDouble did not return expected value");
    });

    test("readDouble works on second value", function() {
        // Arrange
        var byteArray = new Uint8Array(16);
        byteArray[7] = 0x7f;
        byteArray[6] = 0xef;
        byteArray[5] = 0xff;
        byteArray[4] = 0xff;
        byteArray[3] = 0xff;
        byteArray[2] = 0xff;
        byteArray[1] = 0xff;
        byteArray[0] = 0xff;
        byteArray[8] = 0xCE;
        byteArray[9] = 0x98;
        byteArray[10] = 0xAB;
        byteArray[11] = 0x12;
        byteArray[12] = 0x04;
        byteArray[13] = 0x87;
        byteArray[14] = 0x56;
        byteArray[15] = 0xFA;

        // Act
        var doubleValue = dicomParser.bigEndianByteArrayParser.readDouble(byteArray, 8);

        // Assert
        equal(doubleValue, -4.256349017182337e+70, "readDouble did not return expected value");
    });
    */

    test("readDouble throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var double = dicomParser.bigEndianByteArrayParser.readDouble(byteArray, 25);
            },
            "readDouble did not throw on buffer overread"
        )
    });

    test("readDouble throws on position < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var double = dicomParser.bigEndianByteArrayParser.readDouble(byteArray, -1);
            },
            "readDouble did not throw on buffer overread"
        )
    });

})(dicomParser);