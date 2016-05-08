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

        function readTransferSyntax(metaHeaderDataSet) {
            if(metaHeaderDataSet.elements.x00020010 === undefined) {
                throw 'dicomParser.parseDicom: missing required meta header attribute 0002,0010';
            }
            var transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
            return dicomParser.readFixedString(byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
        }

        function isExplicit(transferSyntax) {
            if(transferSyntax === '1.2.840.10008.1.2') // implicit little endian
            {
                return false;
            }
            // all other transfer syntaxes should be explicit
            return true;
        }

        function getDataSetByteStream(transferSyntax, position) {
            if(transferSyntax === '1.2.840.10008.1.2.1.99')
            {
                // if an infalter callback is registered, use it
                if (options && options.inflater) {
                    var fullByteArrayCallback = options.inflater(byteArray, position);
                    return new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, fullByteArrayCallback, 0);
                }
                // if running on node, use the zlib library to inflate
                // http://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
                else if (typeof module !== 'undefined' && this.module !== module) {
                    // inflate it
                    var zlib = require('zlib');
                    var deflatedBuffer = dicomParser.sharedCopy(byteArray, position, byteArray.length - position);
                    var inflatedBuffer = zlib.inflateRawSync(deflatedBuffer);

                    // create a single byte array with the full header bytes and the inflated bytes
                    var fullByteArrayBuffer = dicomParser.alloc(byteArray, inflatedBuffer.length + position);
                    byteArray.copy(fullByteArrayBuffer, 0, 0, position);
                    inflatedBuffer.copy(fullByteArrayBuffer, position);
                    return new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, fullByteArrayBuffer, 0);
                }
                // if pako is defined - use it.  This is the web browser path
                // https://github.com/nodeca/pako
                else if(typeof pako !== "undefined") {
                    // inflate it
                    var deflated = byteArray.slice(position);
                    var inflated = pako.inflateRaw(deflated);

                    // create a single byte array with the full header bytes and the inflated bytes
                    var fullByteArray = dicomParser.alloc(byteArray, inflated.length + position);
                    fullByteArray.set(byteArray.slice(0, position), 0);
                    fullByteArray.set(inflated, position);
                    return new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, fullByteArray, 0);
                }
                // throw exception since no inflater is available
                else {
                    throw 'dicomParser.parseDicom: no inflater available to handle deflate transfer syntax';
                }
            }
            if(transferSyntax === '1.2.840.10008.1.2.2') // explicit big endian
            {
                return new dicomParser.ByteStream(dicomParser.bigEndianByteArrayParser, byteArray, position);
            }
            else
            {
                // all other transfer syntaxes are little endian; only the pixel encoding differs
                // make a new stream so the metaheader warnings don't come along for the ride
                return new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray, position);
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
            var dataSetByteStream = getDataSetByteStream(transferSyntax, metaHeaderDataSet.position);

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
            var metaHeaderDataSet = dicomParser.readPart10Header(byteArray, options);

            var dataSet = readDataSet(metaHeaderDataSet);

            return mergeDataSets(metaHeaderDataSet, dataSet);
        }

        // This is where we actually start parsing
        return parseTheByteStream();
    };

    return dicomParser;
})(dicomParser);
