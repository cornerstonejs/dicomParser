
(function(dicomParser) {
    module("dicomParser.parseDicomDataSetExplicit");

    function makeTestData()
    {
        var byteArray = new Uint8Array(26);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;
        byteArray[4] = 0x4F; // OB
        byteArray[5] = 0x42;
        byteArray[6] = 0x00;
        byteArray[7] = 0x00;
        byteArray[8] = 0x00; // length = 0
        byteArray[9] = 0x00;
        byteArray[10] = 0x00;
        byteArray[11] = 0x00;
        byteArray[12] = 0x10;
        byteArray[13] = 0x22;
        byteArray[14] = 0x33;
        byteArray[15] = 0x44;
        byteArray[16] = 0x4F; // OB
        byteArray[17] = 0x42;
        byteArray[18] = 0x00; // OB
        byteArray[19] = 0x00;
        byteArray[20] = 0x02; // length = 2
        byteArray[21] = 0x00;
        byteArray[22] = 0x00;
        byteArray[23] = 0x00;
        byteArray[24] = 0x00;
        byteArray[25] = 0x00;
        return byteArray;
    }


    test("parse returns DataSet", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Assert
        ok(dataSet, "dataSet created");
    });

    test("DataSet has two elements", function() {
        // Arrange
        var byteArray = makeTestData();
        var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        // Act
        var dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteArray, {});
        dicomParser.parseDicomDataSetExplicit(dataSet, byteStream);

        // Assert
        ok(dataSet.elements.x22104433, "DataSet does not contain element with tag x22104433");
        ok(dataSet.elements.x22114433, "DataSet does not contain element with tag x22114433");
    });

})(dicomParser);