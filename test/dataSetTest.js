(function(dicomParser) {
    module("dicomParser.dataSet");

    function getElements()
    {
        return [
            // x22114433          US         4          0xadde 0x1234
            [0x11, 0x22, 0x33, 0x44, 0x55, 0x53, 0x04, 0x00, 0xde, 0xad, 0x34, 0x12],
            // x22114434          OB                    4                    "O\B"
            [0x11, 0x22, 0x34, 0x44, 0x4F, 0x42, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x4F, 0x5C, 0x42, 0x00],
            // x22114435          DS                    10                    " 1.2\2.3  "
            [0x11, 0x22, 0x35, 0x44, 0x4F, 0x42, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x20, 0x31, 0x2E, 0x32, 0x5C, 0x32, 0x2E, 0x33, 0x20, 0x20],
            // x22114436          IS         2          "1.2\2.3"
            [0x11, 0x22, 0x36, 0x44, 0x49, 0x53, 0x04, 0x00, 0x31, 0x32, 0x33, 0x34],
            // x22114437          DA         8          "20140329"
            [0x11, 0x22, 0x37, 0x44, 0x49, 0x53, 0x08, 0x00, 0x32, 0x30, 0x31, 0x34, 0x30, 0x33, 0x32, 0x39],
            // x22114438          TM         14         "081236.531000"
            [0x11, 0x22, 0x38, 0x44, 0x49, 0x53, 0x0E, 0x00, 0x30, 0x38, 0x31, 0x32, 0x33, 0x36, 0x2E, 0x35, 0x33, 0x31, 0x30, 0x30, 0x30, 0x20],
            // x22114439          PN         10         "F^G^M^P^S"
            [0x11, 0x22, 0x39, 0x44, 0x50, 0x4E, 0x0A, 0x00, 0x46, 0x5E, 0x47, 0x5E, 0x4D, 0x5E, 0x50, 0x5E, 0x53, 0x20],
            // x2211443a          ST         4         " S  "
            [0x11, 0x22, 0x3A, 0x44, 0x50, 0x4E, 0x04, 0x00, 0x20, 0x53, 0x20, 0x20],
            // x2211443b          SL         8          -90745933, 28035055
            [0x11, 0x22, 0x3B, 0x44, 0x50, 0x4E, 0x08, 0x00, 0xB3, 0x53, 0x97, 0xFA, 0xEF, 0xC7, 0xAB, 0x01],
            // x2211443c          FL         8          -73.00198, 17.157354
            [0x11, 0x22, 0x3C, 0x44, 0x50, 0x4E, 0x08, 0x00, 0x04, 0x01, 0x92, 0xC2, 0x41, 0x89, 0x42, 0x43],
            // x2211443d          FD         16          -8.8802474352597842181962204226E41, 4.25797335756869935070373891492E81
            [0x11, 0x22, 0x3D, 0x44, 0x50, 0x4E, 0x08, 0x00, 0xED, 0x91, 0xFB, 0x20, 0x57, 0x63, 0xA4, 0xC8, 0x3D, 0xAC, 0x78, 0x6B, 0x92, 0xF4, 0xE1, 0x50]
        ];
    }

    function getBigEndianElements()
    {
        return [
            // x22114433               US         4          0xadde 0x1234
            [0x22, 0x11, 0x44, 0x33, 0x55, 0x53, 0x00, 0x04, 0xAD, 0xDE, 0x12, 0x34],
            // x2211443b               SL         8          -90745933, 28035055
            [0x22, 0x11, 0x44, 0x3B, 0x50, 0x4E, 0x00, 0x08, 0xFA, 0x97, 0x53, 0xB3, 0x01, 0xAB, 0xC7, 0xEF],
            // x2211443c               FL         8          -73.00198, 17.157354
            [0x22, 0x11, 0x44, 0x3C, 0x50, 0x4E, 0x00, 0x08, 0xC2, 0x92, 0x01, 0x04, 0x43, 0x42, 0x89, 0x41],
            // x2211443d               FD         16         -8.8802474352597842181962204226E41, 4.25797335756869935070373891492E81
            [0x22, 0x11, 0x44, 0x3D, 0x50, 0x4E, 0x00, 0xF0, 0xC8, 0xA4, 0x63, 0x57, 0x20, 0xFB, 0x91, 0xED, 0x50, 0xE1, 0xF4, 0x92, 0x6B, 0x78, 0xAC, 0x3D]
        ];
    }

    function convertElementsToByteArray(elements)
    {
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

    function makeTestData()
    {
        return convertElementsToByteArray(getElements());
    }

    function makeBigEndianTestData()
    {
        return convertElementsToByteArray(getBigEndianElements());
    }


    test("DataSet uint16", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x22114433');

        // Assert
        equal(uint16, 0xadde, "uint16 returned wrong value");
    });

    test("DataSet uint16 with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x22114433', 1);

        // Assert
        equal(uint16,0x1234 , "uint16 returned wrong value");
    });

    test("DataSet uint16 with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x22114433', 1);

        // Assert
        equal(uint16,0x1234 , "uint16 returned wrong value");
    });

    test("DataSet uint16 with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x22114433: {dataOffset: 8, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var uint16 = dataSet.uint16('x22114433', 1);

        // Assert
        equal(uint16,0x1234 , "uint16 returned wrong value");
    });

    test("DataSet uint16 tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint16('x12345678');

        // Assert
        equal(uint16, undefined, "uint16 returned value for nonexistent field");
    });

    test("DataSet int16", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int16 = dataSet.int16('x22114433');

        // Assert
        equal(int16, -21026, "int16 returned wrong value");
    });

    test("DataSet int16 with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int16 = dataSet.int16('x22114433', 1);

        // Assert
        equal(int16, 4660, "int16 returned wrong value");
    });

    test("DataSet int16 with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int16 = dataSet.int16('x22114433', 1);

        // Assert
        equal(int16, 4660, "int16 returned wrong value");
    });

    test("DataSet int16 with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x22114433: {dataOffset: 8, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var int16 = dataSet.int16('x22114433', 1);

        // Assert
        equal(int16, 4660, "int16 returned wrong value");
    });

    test("DataSet int16 tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int16 = dataSet.int16('x12345678');

        // Assert
        equal(int16, undefined, "int16 returned value for nonexistent field");
    });
    
    test("DataSet uint32", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint32 = dataSet.uint32('x2211443b');

        // Assert
        equal(uint32, 4204221363, "uint32 returned wrong value");
    });

    test("DataSet uint32 with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint32 = dataSet.uint32('x2211443b', 1);

        // Assert
        equal(uint32, 28035055, "uint32 returned wrong value");
    });

    test("DataSet uint32 with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x2211443b: {dataOffset: 20, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var uint32 = dataSet.uint32('x2211443b', 1);

        // Assert
        equal(uint32, 28035055, "uint32 returned wrong value");
    });

    test("DataSet uint32 with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint32 = dataSet.uint32('x2211443b', 1);

        // Assert
        equal(uint32, 28035055, "uint32 returned wrong value");
    });

    test("DataSet uint32 tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.uint32('x12345678');

        // Assert
        equal(uint16, undefined, "uint32 returned value for nonexistent field");
    });

    test("DataSet int32", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int32 = dataSet.int32('x2211443b');

        // Assert
        equal(int32, -90745933, "int32 returned wrong value");
    });

    test("DataSet int32 with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int32 = dataSet.int32('x2211443b', 1);

        // Assert
        equal(int32, 28035055, "int32 returned wrong value");
    });

    test("DataSet int32 with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var int32 = dataSet.int32('x2211443b', 1);

        // Assert
        equal(int32, 28035055, "int32 returned wrong value");
    });

    test("DataSet int32 with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x2211443b: {dataOffset: 20, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var int32 = dataSet.int32('x2211443b', 1);

        // Assert
        equal(int32, 28035055, "int32 returned wrong value");
    });

    test("DataSet int32 tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.int32('x12345678');

        // Assert
        equal(uint16, undefined, "int32 returned value for nonexistent field");
    });

    test("DataSet float", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.float('x2211443c');

        // Assert
        equal(float, -73.00198364257812, "float returned wrong value");
    });

    test("DataSet float with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.float('x2211443c', 1);

        // Assert
        equal(float, 194.53614807128906, "float returned wrong value");
    });

    test("DataSet float with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.float('x2211443c', 1);

        // Assert
        equal(float, 194.53614807128906, "float returned wrong value");
    });

    test("DataSet float with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x2211443c: {dataOffset: 36, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var float = dataSet.float('x2211443c', 1);

        // Assert
        equal(float, 194.53614807128906, "float returned wrong value");
    });

    test("DataSet float tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.float('x12345678');

        // Assert
        equal(uint16, undefined, "float returned value for nonexistent field");
    });

    /* commented out since qunit doesn't seem to have Float64Array type - works ok in chrome though
    test("DataSet double", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var double = dataSet.double('x2211443d');

        // Assert
        equal(double, -8.8802474352597842181962204226E41, "double returned wrong value");
    });

    test("DataSet double with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var double = dataSet.double('x2211443d', 1);

        // Assert
        equal(double, 4.25797335756869935070373891492E81, "double returned wrong value");
    });

    test("DataSet double with index big endian", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var double = dataSet.double('x2211443d', 1);

        // Assert
        equal(double, 4.25797335756869935070373891492E81, "double returned wrong value");
    });

    test("DataSet double with index big endian element", function() {
        // Arrange
        var byteArray = makeBigEndianTestData();
        var elements = {x2211443d: {dataOffset: 52, parser: dicomParser.bigEndianByteArrayParser}};
        var dataSet = new dicomParser.DataSet(dicomParser.littleEndianByteArrayParser, byteArray, elements);

        // Act
        var double = dataSet.double('x2211443d', 1);

        // Assert
        equal(double, 4.25797335756869935070373891492E81, "double returned wrong value");
    });
    */

    test("DataSet double tag for nonexistent field", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var uint16 = dataSet.double('x12345678');

        // Assert
        equal(uint16, undefined, "double returned value for nonexistent field");
    });

    test("DataSet numStringValues", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var numStringValues = dataSet.numStringValues('x22114434');

        // Assert
        equal(numStringValues, 2, "numStringValues returned wrong value");
    });

    test("DataSet string", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var str = dataSet.string('x2211443a');

        // Assert
        equal(str, 'S', "string returned wrong value");
    });


    test("DataSet text", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var text = dataSet.text('x2211443a');

        // Assert
        equal(text, ' S', "text returned wrong value");
    });

    test("DataSet string with index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var str = dataSet.string('x22114434', 1);

        // Assert
        equal(str, 'B', "string returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString no index", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435');

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet floatString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var float = dataSet.floatString('x22114435', 0);

        // Assert
        equal(float, 1.2, "floatString returned wrong value");
    });

    test("DataSet intString", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Act
        var val = dataSet.intString('x22114436');

        // Assert
        equal(val, 1234, "intString returned wrong value");
    });


})(dicomParser);
