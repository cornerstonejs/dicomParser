
(function(dicomParser) {
    module("dicomParser.byteArrayParser");

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
        var byteArray = new Uint8Array(10);
        var str = "Hello";
        for(var i=0; i < str.length; i++) {
            byteArray[i] = str.charCodeAt(i);
        }

        // Act
        var fixedString = dicomParser.readFixedString(byteArray, 0, 10);

        // Assert
        equal(fixedString, "Hello", "readFixedString did not return expected value");
    });

})(dicomParser);