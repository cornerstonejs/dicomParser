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
        }
        dicomParser = factory();
    }
}(this, function () {

    /**
     * Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements
     * @param byteArray the byte array
     * @returns {DataSet}
     * @throws error if unable to parse the file
     */
     function parseDicom(byteArray) {

        if(byteArray === undefined)
        {
            throw "dicomParser.parseDicom: missing required parameter 'byteArray'";
        }

        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);

        function readPrefix()
        {
            byteStream.seek(128);
            var prefix = byteStream.readFixedString(4);
            if(prefix !== "DICM")
            {
                throw "dicomParser.parseDicom: DICM prefix not found at location 132";
            }
        }

        function readPart10Header()
        {
            readPrefix();

            // Read the group length element so we know how many bytes needed
            // to read the entire meta header
            var groupLengthElement = dicomParser.readDicomElementExplicit(byteStream);
            var metaHeaderLength = dicomParser.readUint32(byteStream.byteArray, groupLengthElement.dataOffset);
            var positionAfterMetaHeader = byteStream.position + metaHeaderLength;

            var metaHeaderDataSet = dicomParser.parseDicomDataSetExplicit(byteStream, positionAfterMetaHeader);
            metaHeaderDataSet[groupLengthElement.tag] = groupLengthElement;
            return metaHeaderDataSet;
        }

        function isExplicit(metaHeaderDataSet) {
            if(metaHeaderDataSet.elements.x00020010 === undefined) {
                throw 'dicomParser.parseDicom: missing required meta header attribute 0002,0010';
            }
            var transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
            var transferSyntax = dicomParser.readFixedString(byteStream.byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
            if(transferSyntax === '1.2.840.10008.1.2') // implicit little endian
            {
                return false;
            }
            else if(transferSyntax === '1.2.840.10008.1.2.2')
            {
                throw 'dicomParser.parseDicom: explicit big endian transfer syntax not supported';
            }
            // all other transfer syntaxes should be explicit
            return true;
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
            return instanceDataSet;
        }

        function readDataSet(metaHeaderDataSet)
        {
            var explicit = isExplicit(metaHeaderDataSet);

            if(explicit) {
                return dicomParser.parseDicomDataSetExplicit(byteStream);
            }
            else
            {
                return dicomParser.parseDicomDataSetImplicit(byteStream);
            }
        }

        // main function here
        function parseTheByteStream() {
            var metaHeaderDataSet = readPart10Header();

            var dataSet = readDataSet(metaHeaderDataSet);

            dataSet.warnings = byteStream.warnings;

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