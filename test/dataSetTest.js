
(function(dicomParser) {
    module("dicomParser.dataSet");

    function makeTestData()
    {
        var elements = [
            // x22114433          US         4          0xadde 0x1234
            [0x11,0x22,0x33,0x44, 0x55,0x53, 0x04,0x00, 0xde,0xad, 0x34, 0x12],
            // x22114434          OB                    4                    "O\B"
            [0x11,0x22,0x34,0x44, 0x4F,0x42, 0x00,0x00, 0x04,0x00,0x00,0x00, 0x4F, 0x5C, 0x42,0x00],
            // x22114435          DS                    10                    " 1.2\2.3  "
            [0x11,0x22,0x35,0x44, 0x4F,0x42, 0x00,0x00, 0x0A,0x00,0x00,0x00, 0x20, 0x31,0x2E,0x32, 0x5C, 0x32,0x2E,0x33,0x20, 0x20],
            // x22114436          IS         2          "1.2\2.3"
            [0x11,0x22,0x36,0x44, 0x49,0x53, 0x04,0x00, 0x31,0x32,0x33,0x34],
            // x22114437          DA         8          "20140329"
            [0x11,0x22,0x37,0x44, 0x49,0x53, 0x08,0x00, 0x32,0x30,0x31,0x34,0x30,0x33,0x32,0x39],
            // x22114438          TM         14         "081236.531000"
            [0x11,0x22,0x38,0x44, 0x49,0x53, 0x0E,0x00, 0x30,0x38,0x31,0x32,0x33,0x36, 0x2E, 0x35,0x33,0x31,0x30,0x30,0x30, 0x20],
            // x22114439          PN         10         "F^G^M^P^S"
            [0x11,0x22,0x39,0x44, 0x50,0x4E, 0x0A,0x00, 0x46,0x5E,0x47,0x5E,0x4D,0x5E,0x50,0x5E,0x53,0x20],
            // x2211443a          ST         4         " S  "
            [0x11,0x22,0x3A,0x44, 0x50,0x4E, 0x04,0x00, 0x20,0x53,0x20,0x20]
        ];


        var arrayLength = 0;
        elements.forEach(function(element) {
            arrayLength += element.length;
        });

        var byteArray = new Uint8Array(arrayLength);
        var index = 0;
        elements.forEach(function(element) {
            for(var i=0; i < element.length; i++)
            {
                byteArray[index++] = element[i];
            }
        });

        return byteArray;
    }


    test("DataSet uint16", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x22114433');

        // Assert
        equal(uint16, 0xadde, "uint16 returned wrong value");
    });

    test("DataSet uint16", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x22114433', 1);

        // Assert
        equal(uint16,0x1234 , "uint16 returned wrong value");
    });

    test("DataSet uint32", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint32 = dataSet.uint32('x22114434');


        // Assert
        equal(uint32, 0x00425C4F, "uint32 returned wrong value");
    });

    test("DataSet numStringValues", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var numStringValues = dataSet.numStringValues('x22114434');

        // Assert
        equal(numStringValues, 2, "numStringValues returned wrong value");
    });

    test("DataSet string", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var str = dataSet.string('x2211443a');

        // Assert
        equal(str, 'S', "string returned wrong value");
    });


    test("DataSet text", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var text = dataSet.text('x2211443a');

        // Assert
        equal(text, ' S', "text returned wrong value");
    });

    test("DataSet string with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var str = dataSet.string('x22114434', 1);

        // Assert
        equal(str, 'B', "string returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString no index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435');

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet intString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
        var dataSet = new dicomParser.DataSet(byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var val = dataSet.intString('x22114436');

        // Assert
        equal(val, 1234, "intString returned wrong value");
    });


})(dicomParser);