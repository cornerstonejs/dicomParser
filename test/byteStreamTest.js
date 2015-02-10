
(function(dicomParser) {
    module("dicomParser.ByteStream");

    test("construction", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Assert
        ok(byteStream, "construction did not return object");
    });

    test("position 0 on creation", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);

        // Assert
        equal(byteStream.position, 0, "position 0");
    });

    test("position 10 on creation", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray, 10);

        // Assert
        equal(byteStream.position, 10, "position 10");
    });

    test("missing byte stream parser throws", function() {
        // Arrange

        // Act
        throws(
            function() {
                var byteStream = new dicomParser.ByteStream();
            },
            "construction without byteArray parameter throws"
        )
    });

    test("missing byte array throws", function() {
        // Arrange

        // Act
        throws(
            function() {
                var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser);
            },
            "construction without byteArray parameter throws"
        )
    });

    test("constructor throws if byteArray parameter is not Uint8Array", function() {
        // Arrange
        // Arrange
        var uint16Array = new Uint16Array(32);


        // Act
        throws(
            function() {
                var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, uint16Array);
            },
            "construction did not throw on invalid type for byteArray parameter"
        )
    });


    test("position cannot be < 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray, -1);
            },
            "position cannot be < 0"
        )
    });

    test("position cannot equal or exceed array length", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray, 32);
            },
            "position cannot exceed array length"
        )
    });

    test("seek succeeds", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        byteStream.seek(10);

        // Assert
        equal(byteStream.position, 10, "position 10");
    });

    test("seek to negative position throws", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        throws(
            function() {
                byteStream.seek(-1);
            },
            "seek to negative position not throw"
        )
    });

    test("readByteStream returns object", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var subByteStream = byteStream.readByteStream(5);

        // Assert
        ok(subByteStream, "readByteStream did not return an object");
    });

    test("readByteStream returns object with same parser", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);

        // Act
        var subByteStream = byteStream.readByteStream(5);

        // Assert
        equal(subByteStream.byteArrayParser, dicomParser.bigEndianByteArrayParser, "readByteStream did not pass the parser through");
    });

    test("readByteStream returns array with size matching numBytes parameter", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var subByteStream = byteStream.readByteStream(5);

        // Assert
        equal(subByteStream.byteArray.length, 5, "readByteStream returned object with byteArray of wrong length");
    });

    test("readByteStream returns object with position 0", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var subByteStream = byteStream.readByteStream(5);

        // Assert
        equal(subByteStream.position, 0, "readByteStream returned object with position not 0");
    });

    test("readByteStream can read all remaining bytes", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var subByteStream = byteStream.readByteStream(32);

        // Assert
        ok(subByteStream, "readByteStream did not return an object");
    });

    test("readByteStream throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        throws(
            function() {
                var subByteStream = byteStream.readByteStream(40);
            },
            "readByteStream did not throw on buffer overread"
        )
    });

    test("readUint16 works", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0xff;
        byteArray[1] = 0x80;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var uint16 = byteStream.readUint16();

        // Assert
        equal(uint16, 0x80ff, "readUint16 did not return expected value");
    });

    test("readUint16 works with different parser", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x80;
        byteArray[1] = 0xff;
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);

        // Act
        var uint16 = byteStream.readUint16();

        // Assert
        equal(uint16, 0x80ff, "readUint16 did not return expected value");
    });

    test("readUint16 can read at end of buffer", function() {
        // Arrange
        var byteArray = new Uint8Array(2);
        byteArray[0] = 0xff;
        byteArray[1] = 0x80;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var uint16 = byteStream.readUint16();

        // Assert
        equal(uint16, 0x80ff, "readUint16 did not return expected value");
    });


    test("readUint16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        byteStream.seek(31);
        // Act
        throws(
            function() {
                var uint16  = byteStream.readUint16();
            },
            "readUint16 did not throw on buffer overread"
        )
    });

    test("readUint32 works", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var uint32 = byteStream.readUint32();

        // Assert
        equal(uint32, 0x44332211, "readUint32 did not return expected value");
    });

    test("readUint32 works with different parser", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0x44;
        byteArray[1] = 0x33;
        byteArray[2] = 0x22;
        byteArray[3] = 0x11;
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);

        // Act
        var uint32 = byteStream.readUint32();

        // Assert
        equal(uint32, 0x44332211, "readUint32 did not return expected value");
    });

    test("readUint32 can read at end of buffer", function() {
        // Arrange
        var byteArray = new Uint8Array(4);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var uint32 = byteStream.readUint32();

        // Assert
        equal(uint32, 0x44332211, "readUint32 did not return expected value");
    });


    test("readUint32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        byteStream.seek(31);
        // Act
        throws(
            function() {
                var uint16  = byteStream.readUint32();
            },
            "readUint32 did not throw on buffer overread"
        )
    });

    test("readFixedString works", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var fixedString = byteStream.readFixedString(5);

        // Assert
        equal(fixedString, 'Hello', "readFixedString did not return expected value");
    });

    test("readUint32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        throws(
            function() {
                var str  = byteStream.readFixedString(33);
            },
            "readFixedString did not throw on buffer overread"
        )
    });

    test("readUint32 throws on negative length", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        throws(
            function() {
                var str  = byteStream.readFixedString(-1);
            },
            "readFixedString did not throw on negative length"
        )
    });

    test("readFixedString can read at end of buffer", function() {
        // Arrange
        var byteArray = new Uint8Array(5);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var fixedString = byteStream.readFixedString(5);

        // Assert
        equal(fixedString, "Hello", "readFixedString did not return expected value");
    });

    test("readFixedString can read null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var fixedString = byteStream.readFixedString(6);

        // Assert
        equal(fixedString, "Hello", "readFixedString did not return expected value");
    });

    test("readFixedString sets position properly after reading null terminated string", function() {
        // Arrange
        var byteArray = new Uint8Array(6);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var fixedString = byteStream.readFixedString(6);

        // Assert
        equal(byteStream.position, 6, "readFixedString did not set position propery after reading null terminated string");
    });

})(dicomParser);