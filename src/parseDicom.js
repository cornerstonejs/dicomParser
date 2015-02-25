/**
 * This module contains the entry point for parsing a DICOM P10 byte stream
 *
 * This module exports itself as both an AMD module for use with AMD loaders as well
 * as a global browser variable when AMD modules are not being used.  See the following:
 *
 * https://github.com/umdjs/umd/blob/master/amdWeb.js
 *
 */

(function (root, factory) {

    // node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        if(dicomParser === undefined) {
            dicomParser = {};

            // meteor
            if (typeof Package !== 'undefined') {
                root.dicomParser = dicomParser;
            }
        }
        dicomParser = factory();
    }
}(this, function () {

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
     function parseDicom(byteArray, options) {

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

            // Read the group length element so we know how many bytes needed
            // to read the entire meta header.
            // NOTE: While the groupLengthElement is required by DICOM, it is possible that this is not present and
            // it would be nice to support such a case by calculating the group length by reading elements
            // until we find one with a group > x0002
            var groupLengthElement = dicomParser.readDicomElementExplicit(littleEndianByteStream);
            if(groupLengthElement.tag !== 'x00020000') {
                throw 'dicomParser.parseDicom: missing required element x00020000 in P10 Header';
            }
            var metaHeaderLength = dicomParser.littleEndianByteArrayParser.readUint32(littleEndianByteStream.byteArray, groupLengthElement.dataOffset);
            var positionAfterMetaHeader = littleEndianByteStream.position + metaHeaderLength;

            var metaHeaderDataSet = new dicomParser.DataSet(littleEndianByteStream.byteArrayParser, littleEndianByteStream.byteArray, {});
            dicomParser.parseDicomDataSetExplicit(metaHeaderDataSet, littleEndianByteStream, positionAfterMetaHeader);
            metaHeaderDataSet.elements[groupLengthElement.tag] = groupLengthElement;

            // Cache the littleEndianByteArrayParser for meta header elements, since the rest of the data set may be big endian
            // and this parser will be needed later if the meta header values are to be read.
            for (var propertyName in metaHeaderDataSet.elements)
            {
                if(metaHeaderDataSet.elements.hasOwnProperty(propertyName)) {
                    metaHeaderDataSet.elements[propertyName].parser = dicomParser.littleEndianByteArrayParser;
                }
            }
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

            try{
                if(explicit) {
                    dicomParser.parseDicomDataSetExplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
                }
                else
                {
                    dicomParser.parseDicomDataSetImplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
                }
                dataSet.warnings = dataSetByteStream.warnings;
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
    }

    if(dicomParser === undefined) {
        // this happens in the AMD case
        return {
            parseDicom: parseDicom
        };
    }
    else {
        // this is the browser global var case
        dicomParser.parseDicom = parseDicom;
        return dicomParser;
    }
}));
