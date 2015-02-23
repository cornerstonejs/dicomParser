
(function(dicomParser) {
    module("dicomParser.littleEndianByteArrayParser");

    test("readUint16", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0xff;
        byteArray[1] = 0x80;

        // Act
        var uint16 = dicomParser.littleEndianByteArrayParser.readUint16(byteArray, 0);

        // Assert
        equal(uint16, 0x80ff, "readUint16 did not return expected value");
    });

    test("readUint16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.littleEndianByteArrayParser.readUint16(byteArray, 31);
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
                var uint16 = dicomParser.littleEndianByteArrayParser.readUint16(byteArray, -1);
            },
            "readUint16 did not throw on buffer overread"
        )
    });

    test("readInt16 can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        byteArray[0] = 0x3A;
        byteArray[1] = 0xC9;

        // Act
        var int16 = dicomParser.littleEndianByteArrayParser.readInt16(byteArray, 0);

        // Assert
        equal(int16, -14022, "readInt16 did not return expected value");
    });

    test("readInt16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(6);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.littleEndianByteArrayParser.readInt16(byteArray, 5);
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
                var uint16 = dicomParser.littleEndianByteArrayParser.readInt16(byteArray, -1);
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
        var uint32 = dicomParser.littleEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        equal(uint32, 0x44332211, "readUint32 did not return expected value");
    });

    test("readUint32", function() {
        // Arrange
        var byteArray = new Uint8Array(4);
        byteArray[0] = 0xFF;
        byteArray[1] = 0xFF;
        byteArray[2] = 0xFF;
        byteArray[3] = 0xFF;

        // Act
        var uint32 = dicomParser.littleEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        equal(uint32, 4294967295, "readUint32 did not return expected value");
    });


    test("readUint32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint32 = dicomParser.littleEndianByteArrayParser.readUint32(byteArray, 30);
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
                var uint16 = dicomParser.littleEndianByteArrayParser.readUint32(byteArray, -1);
            },
            "readUint32 did not throw on buffer overread"
        )
    });

    test("readInt16 can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        byteArray[0] = 0xFF; // -1
        byteArray[1] = 0xFF

        // Act
        var int16 = dicomParser.littleEndianByteArrayParser.readInt16(byteArray, 0);

        // Assert
        equal(int16, -1, "readInt16 did not return expected value");
    });

    test("readInt32 can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        byteArray[0] = 0xFF; // -1
        byteArray[1] = 0xFF
        byteArray[2] = 0xFF
        byteArray[3] = 0xFF

        // Act
        var int32 = dicomParser.littleEndianByteArrayParser.readInt32(byteArray, 0);

        // Assert
        equal(int32, -1, "readInt32 did not return expected value");
    });

    test("readInt32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var int32 = dicomParser.littleEndianByteArrayParser.readInt32(byteArray, 29);
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
                var int32 = dicomParser.littleEndianByteArrayParser.readInt32(byteArray, -1);
            },
            "readInt32 did not throw on buffer overread"
        )
    });

    test("readFloat works on first value", function() {
        // Arrange
        var byteArray = new Uint8Array(4);
        byteArray[0] = 0x00;
        byteArray[1] = 0x00;
        byteArray[2] = 0xB4;
        byteArray[3] = 0xC0;

        // Act
        var float = dicomParser.littleEndianByteArrayParser.readFloat(byteArray, 0);

        // Assert
        equal(float, -5.625000, "readFloat did not return expected value");
    });

    test("readFloat works on second value", function() {
        // Arrange
        var byteArray = new Uint8Array(8);
        byteArray[0] = 0x00;
        byteArray[1] = 0x00;
        byteArray[2] = 0xB4;
        byteArray[3] = 0xC0;
        byteArray[4] = 0x00;
        byteArray[5] = 0x00;
        byteArray[6] = 0xB4;
        byteArray[7] = 0xC1;

        // Act
        var float = dicomParser.littleEndianByteArrayParser.readFloat(byteArray, 4);

        // Assert
        equal(float, -22.5, "readFloat did not return expected value");
    });

    test("readFloat throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var float = dicomParser.littleEndianByteArrayParser.readFloat(byteArray, 29);
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
                var float = dicomParser.littleEndianByteArrayParser.readFloat(byteArray, -1);
            },
            "readFloat did not throw on buffer overread"
        )
    });

    /* commented out since qunit doesn't seem to have Float64Array type - works ok in chrome though
    test("readDouble works on first value", function() {
        // Arrange
        var byteArray = new Uint8Array(8);
        byteArray[7] = 0x7f;
        byteArray[6] = 0xef;
        byteArray[5] = 0xff;
        byteArray[4] = 0xff;
        byteArray[3] = 0xff;
        byteArray[2] = 0xff;
        byteArray[1] = 0xff;
        byteArray[0] = 0xff;

        // Act
        var doubleValue = dicomParser.littleEndianByteArrayParser.readDouble(byteArray, 0);

        // Assert
        equal(doubleValue, 1.7976931348623157e+308, "readDouble did not return expected value");
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
        byteArray[15] = 0xef;
        byteArray[14] = 0x7f;
        byteArray[13] = 0xff;
        byteArray[12] = 0xff;
        byteArray[11] = 0xff;
        byteArray[10] = 0xff;
        byteArray[9] = 0xff;
        byteArray[8] = 0xff;

        // Act
        var doubleValue = dicomParser.littleEndianByteArrayParser.readDouble(byteArray, 8);

        // Assert
        equal(doubleValue, -1.2129047596099287e+229, "readDouble did not return expected value");
    });
    */

    test("readDouble throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var double = dicomParser.littleEndianByteArrayParser.readDouble(byteArray, 25);
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
                var double = dicomParser.littleEndianByteArrayParser.readDouble(byteArray, -1);
            },
            "readDouble did not throw on buffer overread"
        )
    });

})(dicomParser);
