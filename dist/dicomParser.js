/*! dicomParser - v0.4.1 - 2014-11-11 | (c) 2014 Chris Hafey | https://github.com/chafey/dicomParser */
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
/**
 * Internal helper functions for parsing different types from a byte array
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     *
     * Parses an unsigned int 16 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parsed unsigned int 16
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readUint16 = function(byteArray, position)
    {
        if(position < 0) {
            throw 'dicomParser.readUint16: position cannot be less than 0';
        }
        if(position + 2 > byteArray.length) {
            throw 'dicomParser.readUint16: attempt to read past end of buffer';
        }
        return byteArray[position] + (byteArray[position + 1] * 256);
    };

    /**
     *
     * Parses an signed int 16 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parsed signed int 16
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readInt16 = function(byteArray, position)
    {
        if(position < 0) {
            throw 'dicomParser.readInt16: position cannot be less than 0';
        }
        if(position + 2 > byteArray.length) {
            throw 'dicomParser.readInt16: attempt to read past end of buffer';
        }
        var int16 = byteArray[position] + (byteArray[position + 1] << 8);
        // fix sign
        if(int16 & 0x8000)
        {
            int16 = int16 - 0xFFFF - 1;
        }
        return int16;
    };


    /**
     * Parses an unsigned int 32 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readUint32 = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readUint32: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readUint32: attempt to read past end of buffer';
        }

        var uint32 =(byteArray[position] +
                    (byteArray[position + 1] * 256) +
                    (byteArray[position + 2] * 256 * 256) +
                    (byteArray[position + 3] * 256 * 256 * 256 ));

        return uint32;
    };

    /**
     * Parses an signed int 32 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readInt32 = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readInt32: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readInt32: attempt to read past end of buffer';
        }

        var int32 = (byteArray[position] +
                    (byteArray[position + 1] << 8) +
                    (byteArray[position + 2] << 16) +
                    (byteArray[position + 3] << 24));

        return int32;

    };

    /**
     * Parses 32 bit float from a little endian byte stream and advances
     * the position by 4 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse 32 bit float
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readFloat = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readFloat: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readFloat: attempt to read past end of buffer';
        }

        // I am sure there is a better way than this but this should be safe
        var byteArrayForParsingFloat= new Uint8Array(4);
        byteArrayForParsingFloat[0] = byteArray[position];
        byteArrayForParsingFloat[1] = byteArray[position + 1];
        byteArrayForParsingFloat[2] = byteArray[position + 2];
        byteArrayForParsingFloat[3] = byteArray[position + 3];
        var floatArray = new Float32Array(byteArrayForParsingFloat.buffer);
        return floatArray[0];
    };

    /**
     * Parses 64 bit float from a little endian byte stream and advances
     * the position by 4 bytes
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse 32 bit float
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readDouble = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readDouble: position cannot be less than 0';
        }

        if(position + 8 > byteArray.length) {
            throw 'dicomParser.readDouble: attempt to read past end of buffer';
        }

        // I am sure there is a better way than this but this should be safe
        var byteArrayForParsingFloat= new Uint8Array(8);
        byteArrayForParsingFloat[0] = byteArray[position];
        byteArrayForParsingFloat[1] = byteArray[position + 1];
        byteArrayForParsingFloat[2] = byteArray[position + 2];
        byteArrayForParsingFloat[3] = byteArray[position + 3];
        byteArrayForParsingFloat[4] = byteArray[position + 4];
        byteArrayForParsingFloat[5] = byteArray[position + 5];
        byteArrayForParsingFloat[6] = byteArray[position + 6];
        byteArrayForParsingFloat[7] = byteArray[position + 7];
        var floatArray = new Float64Array(byteArrayForParsingFloat.buffer);
        return floatArray[0];
    };

    /**
     * Reads a string of 8 bit characters from an array of bytes and advances
     * the position by length bytes.  A null terminator will end the string
     * but will not effect advancement of the position.  Trailing and leading
     * spaces are preserved (not trimmed)
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @param length the maximum number of bytes to parse
     * @returns {string} the parsed string
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readFixedString = function(byteArray, position, length)
    {
        if(length < 0)
        {
            throw 'readFixedString - length cannot be less than 0';
        }

        if(position + length > byteArray.length) {
            throw 'dicomParser.readFixedString: attempt to read past end of buffer';
        }

        var result = "";
        for(var i=0; i < length; i++)
        {
            var byte = byteArray[position + i];
            if(byte === 0) {
                position +=  length;
                return result;
            }
            result += String.fromCharCode(byte);
        }

        return result;
    };


    return dicomParser;
}(dicomParser));
/**
 *
 * The DataSet class encapsulates a collection of DICOM Elements and provides various functions
 * to access the data in those elements
 *
 * Rules for handling padded spaces:
 * DS = Strip leading and trailing spaces
 * DT = Strip trailing spaces
 * IS = Strip leading and trailing spaces
 * PN = Strip trailing spaces
 * TM = Strip trailing spaces
 * AE = Strip leading and trailing spaces
 * CS = Strip leading and trailing spaces
 * SH = Strip leading and trailing spaces
 * LO = Strip leading and trailing spaces
 * LT = Strip trailing spaces
 * ST = Strip trailing spaces
 * UT = Strip trailing spaces
 *
 */
var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Constructs a new DataSet given byteArray and collection of elements
     * @param byteArray
     * @param elements
     * @constructor
     */
    dicomParser.DataSet = function(byteArray, elements)
    {
        this.byteArray = byteArray;
        this.elements = elements;
    };

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} unsigned int 16 or undefined if the attribute is not present or has data of length 0
     */
    dicomParser.DataSet.prototype.uint16 = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readUint16(this.byteArray, element.dataOffset + (index *2));
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an signed int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} signed int 16 or undefined if the attribute is not present or has data of length 0
     */
    dicomParser.DataSet.prototype.int16 = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readInt16(this.byteArray, element.dataOffset + (index * 2));
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} unsigned int 32 or undefined if the attribute is not present or has data of length 0
     */
    dicomParser.DataSet.prototype.uint32 = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readUint32(this.byteArray, element.dataOffset + (index * 4));
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an signed int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} signed int 32 or undefined if the attribute is not present or has data of length 0
     */
    dicomParser.DataSet.prototype.int32 = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readInt32(this.byteArray, element.dataOffset + (index * 4));
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns a 32 bit floating point number (VR=FL) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} float or undefined if the attribute is not present or has data of length 0
     */
    dicomParser.DataSet.prototype.float = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readFloat(this.byteArray, element.dataOffset + (index * 4));
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns a 64 bit floating point number (VR=FD) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} float or undefined if the attribute is not present or doesn't has data of length 0
     */
    dicomParser.DataSet.prototype.double = function(tag, index)
    {
        var element = this.elements[tag];
        index = (index !== undefined) ? index : 0;
        if(element && element.length !== 0)
        {
            return dicomParser.readDouble(this.byteArray, element.dataOffset + (index * 8));
        }
        return undefined;
    };

    /**
     * Returns the number of string values for the element
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} the number of string values or undefined if the attribute is not present or has zero length data
     */
    dicomParser.DataSet.prototype.numStringValues = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            var fixedString = dicomParser.readFixedString(this.byteArray, element.dataOffset, element.length);
            var numMatching = fixedString.match(/\\/g);
            if(numMatching === null)
            {
                return 1;
            }
            return numMatching.length + 1;
        }
        return undefined;
    };

    /**
     * Returns a string for the element.  If index is provided, the element is assumed to be
     * multi-valued and will return the component specified by index.  Undefined is returned
     * if there is no component with the specified index, the element does not exist or is zero length.
     *
     * Use this function for VR types of AE, CS, SH and LO
     *
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the entire string
     * @returns {*}
     */
    dicomParser.DataSet.prototype.string = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            var fixedString = dicomParser.readFixedString(this.byteArray, element.dataOffset, element.length);
            if(index >= 0)
            {
                var values = fixedString.split('\\');
                // trim trailing spaces
                return values[index].trim();
            }
            else
            {
                // trim trailing spaces
                return fixedString.trim();
            }
        }
        return undefined;
    };

    /**
     * Returns a string with the leading spaces preserved and trailing spaces removed.
     *
     * Use this function to access data for VRs of type UT, ST and LT
     *
     * @param tag
     * @param index
     * @returns {*}
     */
    dicomParser.DataSet.prototype.text = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            var fixedString = dicomParser.readFixedString(this.byteArray, element.dataOffset, element.length);
            if(index >= 0)
            {
                var values = fixedString.split('\\');
                return values[index].replace(/ +$/, '');
            }
            else
            {
                return fixedString.replace(/ +$/, '');
            }
        }
        return undefined;
    };

    /**
     * Parses a string to a float for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} a floating point number or undefined if not present or data not long enough
     */
    dicomParser.DataSet.prototype.floatString = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            index = (index !== undefined) ? index : 0;
            var value = this.string(tag, index);
            if(value !== undefined) {
                return parseFloat(value);
            }
        }
        return undefined;
    };

    /**
     * Parses a string to an integer for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} an integer or undefined if not present or data not long enough
     */
    dicomParser.DataSet.prototype.intString = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0) {
            index = (index !== undefined) ? index : 0;
            var value = this.string(tag, index);
            if(value !== undefined) {
                return parseInt(value);
            }
        }
        return undefined;
    };

    /**
     * Parses a DA formatted string into a Javascript Date object
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} Javascript Date object or undefined if not present or not 8 bytes long
     */
    dicomParser.DataSet.prototype.date = function(tag)
    {
        var value = this.string(tag);
        if(value && value.length === 8)
        {
            var yyyy = parseInt(value.substring(0, 4), 10);
            var mm = parseInt(value.substring(4, 6), 10);
            var dd = parseInt(value.substring(6, 8), 10);

            return new Date(yyyy, mm - 1, dd);
        }
        return undefined;
    };

    /**
     * Parses a TM formatted string into a javascript object with properties for hours, minutes, seconds and fractionalSeconds
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} javascript object with properties for hours, minutes, seconds and fractionalSeconds or undefined if no element or data
     */
    dicomParser.DataSet.prototype.time = function(tag)
    {
        var value = this.string(tag);
        if(value && value.length >=  2) // must at least have HH
        {
            // 0123456789
            // HHMMSS.FFFFFF
            var hh = parseInt(value.substring(0, 2), 10);
            var mm = value.length >= 4 ? parseInt(value.substring(2, 4), 10) : 0;
            var ss = value.length >= 6 ? parseInt(value.substring(4, 6), 10) : 0;
            var ffffff = value.length >= 8 ? parseInt(value.substring(7, 13), 10) : 0;

            return {
                hours: hh,
                minutes: mm,
                seconds: ss,
                fractionalSeconds: ffffff
            };
        }
        return undefined;
    };

    /**
     * Parses a PN formatted string into a javascript object with properties for givenName, familyName, middleName, prefix and suffix
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index
     * @returns {*} javascript object with properties for givenName, familyName, middleName, prefix and suffix or undefined if no element or data
     */
    dicomParser.DataSet.prototype.personName = function(tag, index)
    {
        var stringValue = this.string(tag, index);
        if(stringValue)
        {
            var stringValues = stringValue.split('^');
            return {
                familyName: stringValues[0],
                givenName: stringValues[1],
                middleName: stringValues[2],
                prefix: stringValues[3],
                suffix: stringValues[4]
            };
        }
        return undefined;
    };

    //dicomParser.DataSet = DataSet;

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * reads from the byte stream until it finds the magic numbers for the item delimitation item
     * and then sets the length of the element
     * @param byteStream
     * @param element
     */
    dicomParser.findItemDelimitationItemAndSetElementLength = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";
        }

        var itemDelimitationItemLength = 8; // group, element, length
        var maxPosition = byteStream.byteArray.length - itemDelimitationItemLength;
        while(byteStream.position <= maxPosition)
        {
            var groupNumber = byteStream.readUint16();
            if(groupNumber === 0xfffe)
            {
                var elementNumber = byteStream.readUint16();
                if(elementNumber === 0xe00d)
                {
                    // NOTE: It would be better to also check for the length to be 0 as part of the check above
                    // but we will just log a warning for now
                    var itemDelimiterLength = byteStream.readUint32(); // the length
                    if(itemDelimiterLength !== 0) {
                        byteStream.warnings('encountered non zero length following item delimeter at position' + byteStream.position - 4 + " while reading element of undefined length with tag ' + element.tag");
                    }
                    element.length = byteStream.position - element.dataOffset;
                    return;

                }
            }
        }

        // No item delimitation item - silently set the length to the end of the buffer and set the position past the end of the buffer
        element.length = byteStream.byteArray.length - element.dataOffset;
        byteStream.seek(byteStream.byteArray.length - byteStream.position);
    };


    return dicomParser;
}(dicomParser));
/**
 *
 * Interal helper class to assist with parsing class supports reading from a little endian byte
 * stream contained in an Uint18Array.  Example usage:
 *
 *  var byteArray = new Uint8Array(32);
 *  var byteStream = new dicomParser.LittleEndianByteStream(byteArray);
 *
 * */
var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Constructor for LittleEndianByteStream objects.
     * @param byteArray a Uint8Array containing the byte stream
     * @param position (optional) the position to start reading from.  0 if not specified
     * @constructor
     * @throws will throw an error the byteArray parameter is not present or invalid
     * @throws will throw an error the position parameter is not inside the byteArray
     */
    dicomParser.LittleEndianByteStream = function(byteArray, position) {
        if(byteArray === undefined)
        {
            throw "dicomParser.LittleEndianByteStream: missing required parameter 'byteArray'";
        }
        if((byteArray instanceof Uint8Array) === false) {
            throw 'dicomParser.LittleEndianByteStream: parameter byteArray is not of type Uint8Array';
        }
        if(position < 0)
        {
            throw "dicomParser.LittleEndianByteStream: parameter 'position' cannot be less than 0";
        }
        if(position >= byteArray.length)
        {
            throw "dicomParser.LittleEndianByteStream: parameter 'position' cannot be greater than or equal to 'byteArray' length";

        }
        this.byteArray = byteArray;
        this.position = position ? position : 0;
        this.warnings = []; // array of string warnings encountered while parsing
    };

    /**
     * Safely seeks through the byte stream.  Will throw an exception if an attempt
     * is made to seek outside of the byte array.
     * @param offset the number of bytes to add to the position
     * @throws error if seek would cause position to be outside of the byteArray
     */
    dicomParser.LittleEndianByteStream.prototype.seek = function(offset)
    {
        if(this.position + offset < 0)
        {
            throw "cannot seek to position < 0";
        }
        this.position += offset;
    };

    /**
     * Returns a new LittleEndianByteStream object from the current position and of the requested number of bytes
     * @param numBytes the length of the byteArray for the LittleEndianByteStream to contain
     * @returns {dicomParser.LittleEndianByteStream}
     * @throws error if buffer overread would occur
     */
    dicomParser.LittleEndianByteStream.prototype.readByteStream = function(numBytes)
    {
        if(this.position + numBytes > this.byteArray.length) {
            throw 'readByteStream - buffer overread';
        }
        var byteArrayView = new Uint8Array(this.byteArray.buffer, this.position, numBytes);
        this.position += numBytes;
        return new dicomParser.LittleEndianByteStream(byteArrayView);
    };

    /**
     *
     * Parses an unsigned int 16 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @returns {*} the parsed unsigned int 16
     * @throws error if buffer overread would occur
     */
    dicomParser.LittleEndianByteStream.prototype.readUint16 = function()
    {
        var result = dicomParser.readUint16(this.byteArray, this.position);
        this.position += 2;
        return result;
    };

    /**
     * Parses an unsigned int 32 from a little endian byte stream and advances
     * the position by 2 bytes
     *
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     */
    dicomParser.LittleEndianByteStream.prototype.readUint32 = function()
    {
        var result = dicomParser.readUint32(this.byteArray, this.position);
        this.position += 4;
        return result;
    };

    /**
     * Reads a string of 8 bit characters from an array of bytes and advances
     * the position by length bytes.  A null terminator will end the string
     * but will not effect advancement of the position.
     * @param length the maximum number of bytes to parse
     * @returns {string} the parsed string
     * @throws error if buffer overread would occur
     */
    dicomParser.LittleEndianByteStream.prototype.readFixedString = function(length)
    {
        var result = dicomParser.readFixedString(this.byteArray, this.position, length);
        this.position += length;
        return result;

    };

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * reads an explicit data set
     * @param byteStream the byte stream to read from
     * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
     * @returns {dicomParser.DataSet}
     */
    dicomParser.parseDicomDataSetExplicit = function (byteStream, maxPosition) {

        maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition ;

        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetExplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetExplicit: invalid value for parameter 'maxPosition'";
        }
        var elements = {};


        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    };

    /**
     * reads an implicit data set
     * @param byteStream the byte stream to read from
     * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
     * @returns {dicomParser.DataSet}
     */
    dicomParser.parseDicomDataSetImplicit = function(byteStream, maxPosition)
    {
        maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition ;

        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetImplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetImplicit: invalid value for parameter 'maxPosition'";
        }

        var elements = {};


        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    };

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    function getDataLengthSizeInBytesForVR(vr)
    {
        if( vr === 'OB' ||
            vr === 'OW' ||
            vr === 'SQ' ||
            vr === 'OF' ||
            vr === 'UT' ||
            vr === 'UN')
        {
            return 4;
        }
        else
        {
            return 2;
        }
    }

    dicomParser.readDicomElementExplicit = function(byteStream)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementExplicit: missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            vr : byteStream.readFixedString(2)
            // length set below based on VR
            // dataOffset set below based on VR and size of length
        };

        var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);
        if(dataLengthSizeBytes === 2)
        {
            element.length = byteStream.readUint16();
            element.dataOffset = byteStream.position;
        }
        else
        {
            byteStream.seek(2);
            element.length = byteStream.readUint32();
            element.dataOffset = byteStream.position;
        }

        if(element.length === 4294967295)
        {
            element.hadUndefinedLength = true;
        }

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.readSequenceItemsExplicit(byteStream, element);
            return element;
        }
        if(element.length === 4294967295)
        {
            dicomParser.findItemDelimitationItemAndSetElementLength(byteStream, element);
            return element;
        }

        byteStream.seek(element.length);
        return element;
    };

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    dicomParser.readDicomElementImplicit = function(byteStream)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            length: byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        if(element.length === 4294967295)
        {
            element.hadUndefinedLength = true;
        }

        // peek ahead at the next tag to see if it looks like a sequence.  This is not 100%
        // safe because a non sequence item could have data that has these bytes, but this
        // is how to do it without a data dictionary
        var nextTag = dicomParser.readTag(byteStream);
        byteStream.seek(-4);

        if(nextTag === 'xfffee000')
        {
            // parse the sequence
            dicomParser.readSequenceItemsImplicit(byteStream, element);
            element.length = byteStream.byteArray.length - element.dataOffset;
            return element;
        }

        // if element is not a sequence and has undefined length, we have to
        // scan the data for a magic number to figure out when it ends.
        if(element.length === 4294967295)
        {
            dicomParser.findItemDelimitationItemAndSetElementLength(byteStream, element);
            return element;
        }

        // non sequence element with known length, skip over the data part
        byteStream.seek(element.length);
        return element;
    };


    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }


    function readFrame(byteStream, baseOffset, frameOffsets, frame)
    {
        if(frame >= frameOffsets.length) {
            throw 'readFrame: parameter frame refers to frame not in frameOffsets';
        }

        // position the byteStream at the beginning of this frame
        var frameOffset = frameOffsets[frame];
        byteStream.position = baseOffset + frameOffset;

        // calculate the next frame offset so we know when to stop reading this frame
        var nextFrameOffset = byteStream.byteArray.length;
        if(frame < frameOffsets.length - 1) {
            nextFrameOffset = frameOffsets[frame+1];
        }

        // read all fragments for this frame
        var fragments = [];
        var frameSize = 0;
        while(byteStream.position < nextFrameOffset) {
            var fragment = dicomParser.readSequenceItem(byteStream);
            if(fragment.tag === 'xfffee0dd')
            {
                break;
            }
            fragments.push(fragment);
            frameSize += fragment.length;
            byteStream.seek(fragment.length);
        }

        // if there is only one fragment, return a view on this array to avoid copying
        if(fragments.length === 1) {
            return new Uint8Array(byteStream.byteArray.buffer, fragments[0].dataOffset, fragments[0].length);
        }

        // copy all of the data from the fragments into the pixelData

        var pixelData = new Uint8Array(frameSize);
        var pixelDataIndex = 0;
        for(var i=0; i < fragments.length; i++) {
            var fragmentOffset = fragments[i].dataOffset;
            for(var j=0; j < fragments[i].length; j++) {
                pixelData[pixelDataIndex++] = byteStream.byteArray[fragmentOffset++];
            }
        }

        //console.log('read frame #' + frame + " with " + fragments.length + " fragments and " + pixelData.length + " bytes");

        return pixelData;
    }

    dicomParser.readEncapsulatedPixelData = function(dataSet, frame)
    {
        if(dataSet === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'dataSet'";
        }
        if(frame === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'frame'";
        }
        var pixelElement = dataSet.elements.x7fe00010;
        if(pixelElement === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: pixel data element x7fe00010 not present";
        }

        // seek to the beginning of the encapsulated pixel data and read the basic offset table
        var byteStream = new dicomParser.LittleEndianByteStream(dataSet.byteArray);
        byteStream.seek(pixelElement.dataOffset);
        var basicOffsetTable = dicomParser.readSequenceItem(byteStream);
        if(basicOffsetTable.tag !== 'xfffee000') {
            throw "dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000";
        }

        // now that we know how many frames we have validate the frame parameter
        var numFrames = basicOffsetTable.length / 4;
        if(frame > numFrames - 1) {
            throw "dicomParser.readEncapsulatedPixelData: parameter frame exceeds number of frames in basic offset table";
        }

        // read all the frame offsets
        var frameOffsets =[];
        for(var frameOffsetNum = 0; frameOffsetNum < numFrames; frameOffsetNum++)
        {
            var frameOffset = byteStream.readUint32();
            frameOffsets.push(frameOffset);
        }

        // now read the frame
        var baseOffset = byteStream.position;
        var pixelData = readFrame(byteStream, baseOffset, frameOffsets, frame);
        return pixelData;
    };

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    function readDicomDataSetExplicitUndefinedLength(byteStream)
    {
        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream);
            elements[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArray, elements);
            }

        }

        // eof encountered - log a warning and return what we have for the element
        byteStream.warnings.push('eof encountered before finding sequence delimitation item while reading sequence item of undefined length');
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function readSequenceItemExplicit(byteStream)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === 4294967295)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetExplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetExplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function readSQElementUndefinedLengthExplicit(byteStream, element)
    {
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemExplicit(byteStream);
            element.items.push(item);

            // If this is the sequence delimitation item, return the offset of the next element
            if(item.tag === 'xfffee0dd')
            {
                // sequence delimitation item, update attr data length and return
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }

        // eof encountered - log a warning and set the length of the element based on the buffer size
        byteStream.warnings.push('eof encountered before finding sequence delimitation item in sequence element of undefined length with tag ' + element.tag);
        element.length = byteStream.byteArray.length - element.dataOffset;
    }

    function readSQElementKnownLengthExplicit(byteStream, element)
    {
        var maxPosition = element.dataOffset + element.length;
        while(byteStream.position < maxPosition)
        {
            var item = readSequenceItemExplicit(byteStream);
            element.items.push(item);
        }
    }

    dicomParser.readSequenceItemsExplicit = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readSequenceItemsExplicit: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.readSequenceItemsExplicit: missing required parameter 'element'";
        }

        element.items = [];

        if(element.length === 4294967295)
        {
            readSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            readSQElementKnownLengthExplicit(byteStream, element);
        }
    };


    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    function readDicomDataSetImplicitUndefinedLength(byteStream)
    {
        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream);
            elements[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArray, elements);
            }
        }
        // eof encountered - log a warning and return what we have for the element
        byteStream.warnings.push('eof encountered before finding sequence item delimeter in sequence item of undefined length');
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function readSequenceItemImplicit(byteStream)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === 4294967295)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetImplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetImplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function readSQElementUndefinedLengthImplicit(byteStream, element)
    {
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemImplicit(byteStream);
            element.items.push(item);

            // If this is the sequence delimitation item, return the offset of the next element
            if(item.tag === 'xfffee0dd')
            {
                // sequence delimitation item, update attr data length and return
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }

        // eof encountered - log a warning and set the length of the element based on the buffer size
        byteStream.warnings.push('eof encountered before finding sequence delimitation item in sequence of undefined length');
        element.length = byteStream.byteArray.length - element.dataOffset;
    }

    function readSQElementKnownLengthImplicit(byteStream, element)
    {
        var maxPosition = element.dataOffset + element.length;
        while(byteStream.position < maxPosition)
        {
            var item = readSequenceItemImplicit(byteStream);
            element.items.push(item);
        }
    }

    /**
     * Reads sequence items for an element in an implicit little endian byte stream
     * @param byteStream the implicit little endian byte stream
     * @param element the element to read the sequence items for
     */
    dicomParser.readSequenceItemsImplicit = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readSequenceItemsImplicit: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.readSequenceItemsImplicit: missing required parameter 'element'";
        }

        element.items = [];

        if(element.length === 4294967295)
        {
            readSQElementUndefinedLengthImplicit(byteStream, element);
        }
        else
        {
            readSQElementKnownLengthImplicit(byteStream, element);
        }
    };

    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Reads the tag and length of a sequence item and returns them as an object with the following properties
     *  tag : string for the tag of this element in the format xggggeeee
     *  length: the number of bytes in this item or 4294967295 if undefined
     *  dataOffset: the offset into the byteStream of the data for this item
     * @param byteStream the byte
     * @returns {{tag: string, length: integer, dataOffset: integer}}
     */
    dicomParser.readSequenceItem = function(byteStream)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readSequenceItem: missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            length : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        return element;
    };


    return dicomParser;
}(dicomParser));
/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Reads a tag (group number and element number) from a byteStream
     * @param byteStream the byte stream to read from
     * @returns {string} the tag in format xggggeeee where gggg is the lowercase hex value of the group number
     * and eeee is the lower case hex value of the element number
     */
    dicomParser.readTag = function(byteStream)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readTag: missing required parameter 'byteStream'";
        }

        var groupNumber =  byteStream.readUint16() * 256 * 256;
        var elementNumber = byteStream.readUint16();
        var tag = "x" + ('00000000' + (groupNumber + elementNumber).toString(16)).substr(-8);
        return tag;
    };

    return dicomParser;
}(dicomParser));