
(function(dicomParser) {
    module("dicomParser.byteArrayParser");

    test("readUint16", function() {
        // Arrange
        var byteArray = new Uint8Array(32);
        byteArray[0] = 0xff;
        byteArray[1] = 0x80;

        // Act
        var uint16 = dicomParser.readUint16(byteArray, 0);

        // Assert
        equal(uint16, 0x80ff, "readUint16 did not return expected value");
    });

    test("readUint16 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint16 = dicomParser.readUint16(byteArray, 31);
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
                var uint16 = dicomParser.readUint16(byteArray, -1);
            },
            "readUint16 did not throw on buffer overread"
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
        var uint32 = dicomParser.readUint32(byteArray, 0);

        // Assert
        equal(uint32, 0x44332211, "readUint32 did not return expected value");
    });

    test("readUint32 throws on buffer overread", function() {
        // Arrange
        var byteArray = new Uint8Array(32);

        // Act
        throws(
            function() {
                var uint32 = dicomParser.readUint32(byteArray, 30);
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
                var uint16 = dicomParser.readUint32(byteArray, -1);
            },
            "readUint32 did not throw on buffer overread"
        )
    });

    test("readFixedString can read at end of buffer", function() {
        // Arrange
        var byteArray = new Uint8Array(5);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }

        // Act
        var fixedString = dicomParser.readFixedString(byteArray, 0, 5);

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

        // Act
        var fixedString = dicomParser.readFixedString(byteArray, 0, 6);

        // Assert
        equal(fixedString, "Hello", "readFixedString did not return expected value");
    });


})(dicomParser);