    /**
     * Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements.  If the options
     * argument is supplied and it contains the untilTag property, parsing will stop once that
     * tag is encoutered.  This can be used to parse partial byte streams.
     *
     * @param byteArray the byte array
     * @param options object to control parsing behavior (optional)
     * @returns {DataSet}
     * @throws error if an error occurs while parsing.  The exception object will contain a property dataSet with the
     *         elements successfully parsed before the error.
     */
var dicomParser = (function(dicomParser) {
    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    dicomParser.parseDicom = function(byteArray, options) {

        if(byteArray === undefined)
        {
            throw "dicomParser.parseDicom: missing required parameter 'byteArray'";
        }

        var littleEndianByteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);

        function readPrefix()
        {
            littleEndianByteStream.seek(128);
            var prefix = littleEndianByteStream.readFixedString(4);
            if(prefix !== "DICM")
            {
                throw "dicomParser.parseDicom: DICM prefix not found at location 132";
            }
        }

        function readPart10Header()
        {
            // Per the DICOM standard, the header is always encoded in Explicit VR Little Endian (see PS3.10, section 7.1)
            // so use littleEndianByteStream throughout this method regardless of the transfer syntax
            readPrefix();

            var warnings = [];
            var elements = {};
            while(littleEndianByteStream.position < littleEndianByteStream.byteArray.length) {
                var position = littleEndianByteStream.position;
                var element = dicomParser.readDicomElementExplicit(littleEndianByteStream, warnings);
                if(element.tag > 'x0002ffff') {
                    littleEndianByteStream.position = position;
                    break;
                }
                // Cache the littleEndianByteArrayParser for meta header elements, since the rest of the data set may be big endian
                // and this parser will be needed later if the meta header values are to be read.
                element.parser = dicomParser.littleEndianByteArrayParser;
                elements[element.tag] = element;
            }
            var metaHeaderDataSet = new dicomParser.DataSet(littleEndianByteStream.byteArrayParser, littleEndianByteStream.byteArray, elements);
            metaHeaderDataSet.warnings = littleEndianByteStream.warnings;
            return metaHeaderDataSet;
        }

        function readTransferSyntax(metaHeaderDataSet) {
            if(metaHeaderDataSet.elements.x00020010 === undefined) {
                throw 'dicomParser.parseDicom: missing required meta header attribute 0002,0010';
            }
            var transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
            return dicomParser.readFixedString(littleEndianByteStream.byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
        }

        function isExplicit(transferSyntax) {
            if(transferSyntax === '1.2.840.10008.1.2') // implicit little endian
            {
                return false;
            }
            // all other transfer syntaxes should be explicit
            return true;
        }

        function getDataSetByteStream(transferSyntax) {
            if(transferSyntax === '1.2.840.10008.1.2.2') // explicit big endian
            {
                return new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray, littleEndianByteStream.position);
            }
            else
            {
                // all other transfer syntaxes are little endian; only the pixel encoding differs
                // make a new stream so the metaheader warnings don't come along for the ride
                return new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray, littleEndianByteStream.position);
            }
        }

        function mergeDataSets(metaHeaderDataSet, instanceDataSet)
        {
            for (var propertyName in metaHeaderDataSet.elements)
            {
                if(metaHeaderDataSet.elements.hasOwnProperty(propertyName))
                {
                    instanceDataSet.elements[propertyName] = metaHeaderDataSet.elements[propertyName];
                }
            }
            if (metaHeaderDataSet.warnings !== undefined) {
                instanceDataSet.warnings = metaHeaderDataSet.warnings.concat(instanceDataSet.warnings);
            }
            return instanceDataSet;
        }

        function readDataSet(metaHeaderDataSet)
        {
            var transferSyntax = readTransferSyntax(metaHeaderDataSet);
            var explicit = isExplicit(transferSyntax);
            var dataSetByteStream = getDataSetByteStream(transferSyntax);

            var elements = {};
            var dataSet = new dicomParser.DataSet(dataSetByteStream.byteArrayParser, dataSetByteStream.byteArray, elements);
            dataSet.warnings = dataSetByteStream.warnings;

            try{
                if(explicit) {
                    dicomParser.parseDicomDataSetExplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
                }
                else
                {
                    dicomParser.parseDicomDataSetImplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
                }
            }
            catch(e) {
                var ex = {
                    exception: e,
                    dataSet: dataSet
                };
                throw ex;
            }
            return dataSet;
        }

        // main function here
        function parseTheByteStream() {
            var metaHeaderDataSet = readPart10Header();

            var dataSet = readDataSet(metaHeaderDataSet);

            return mergeDataSets(metaHeaderDataSet, dataSet);
        }

        // This is where we actually start parsing
        return parseTheByteStream();
    };

    return dicomParser;
})(dicomParser);
