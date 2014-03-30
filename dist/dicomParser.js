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
            throw 'uint16 - position cannot be less than 0';
        }
        if(position + 2 > byteArray.length) {
            throw 'uint16 - buffer overread';
        }
        return byteArray[position] + (byteArray[position + 1] << 8);
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
            throw 'readFixedString - length cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'uint32 - buffer overread';
        }

        return (byteArray[position] +
            (byteArray[position + 1] << 8) +
            (byteArray[position + 2] << 16) +
            (byteArray[position + 3] << 24));
    };

    /**
     * Reads a string of 8 bit characters from an array of bytes and advances
     * the position by length bytes.  A null terminator will end the string
     * but will not effect advancement of the position.
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
            throw 'readFixedString - buffer overread';
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
     * @returns {*} unsigned int 16 or undefined if the attribute is not present or doesn't have data of length 2
     */
    dicomParser.DataSet.prototype.uint16 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 2)
        {
            return dicomParser.readUint16(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} unsigned int 32 or undefined if the attribute is not present or doesn't have data of length 4
     */
    dicomParser.DataSet.prototype.uint32 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 4)
        {
            return dicomParser.readUint32(this.byteArray, element.dataOffset);
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
     * Returns the full string for the element index is not specified or if specified,
     * the value at the specified index for a multi-valued string
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
                return values[index];
            }
            else
            {
                return fixedString;
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
            index |= 0;
            var value = this.string(tag, index);
            if(value) {
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
            index |= 0;
            var value = this.string(tag, index);
            return parseInt(value);
        }
        return undefined;
    };

    /**
     * Parses a DA formatted string into a Javascript Date object
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index
     * @returns {*} Javascript Date object or undefined if not present or not 8 bytes long
     */
    dicomParser.DataSet.prototype.date = function(tag, index)
    {
        var value = this.string(tag, index);
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
     * @param index
     * @returns {*} javascript object with properties for hours, minutes, seconds and fractionalSeconds or undefined if no element or data
     */
    dicomParser.DataSet.prototype.time = function(tag, index)
    {
        var value = this.string(tag, index);
        if(value && value.length >=  2) // must at least have HH
        {
            // 0123456789
            // HHMMSS.FFFFFF
            var hh = parseInt(value.substring(0, 2), 10);
            var mm = value.length >= 4 ? parseInt(value.substring(2, 4), 10) : 0;
            var ss = value.length >= 6 ? parseInt(value.substring(4, 6), 10) : 0;
            var fff = value.length >= 7 ? parseInt(value.substring(7, 13), 10) : 0; /// note - javascript date object is only precise to milliseconds

            return {
                hours: hh,
                minutes: mm,
                seconds: ss,
                fractionalSeconds: fff
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
        this.byteArray = byteArray;
        this.position = position ? position : 0;

        if(!byteArray)
        {
            throw "missing required parameter 'byteArray'";
        }
        if((byteArray instanceof Uint8Array) === false) {
            throw 'parameter byteArray is not of type Uint8Array';
        }
        if(this.position < 0)
        {
            throw "parameter 'position' cannot be less than 0";
        }
        if(this.position >= byteArray.length)
        {
            throw "parameter 'position' cannot be larger than 'byteArray' length";
        }
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
 * This module contains the entry point for parsing a DICOM P10 byte stream
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
     * Parses a DICOM P10 byte array and returns a DataSet object
     * @type {Function}
     * @param byteArray the byte array
     * @returns {DataSet}
     */
    dicomParser.parseDicom = function(byteArray) {

        var byteStream = new dicomParser.LittleEndianByteStream(byteArray);

        if(!byteArray)
        {
            throw "missing required parameter 'byteStream'";
        }

        function readPrefix()
        {
            byteStream.seek(128);
            var prefix = byteStream.readFixedString(4);
            if(prefix !== "DICM")
            {
                throw "DICM prefix not found at location 132 in this byteStream";
            }
        }

        function readPart10Header()
        {
            readPrefix();

            // Read the group length element so we know how many bytes needed
            // to read the entire meta header
            var groupLengthElement = dicomParser.parseDicomElementExplicit(byteStream);
            var metaHeaderLength = dicomParser.readUint32(byteStream.byteArray, groupLengthElement.dataOffset);
            var positionAfterMetaHeader = byteStream.position + metaHeaderLength;

            var metaHeaderDataSet = dicomParser.parseDicomDataSetExplicit(byteStream, positionAfterMetaHeader);
            metaHeaderDataSet[groupLengthElement.tag] = groupLengthElement;
            return metaHeaderDataSet;
        }

        function isExplicit(metaHeaderDataSet) {
            if(metaHeaderDataSet.elements.x00020010 === undefined) {
                throw 'missing required meta header attribute 0002,0010';
            }
            var transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
            var transferSyntax = dicomParser.readFixedString(byteStream.byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
            if(transferSyntax === '1.2.840.10008.1.2') // implicit little endian
            {
                return false;
            }
            else if(transferSyntax === '1.2.840.10008.1.2.2')
            {
                throw 'explicit big endian transfer syntax not supported';
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

            return mergeDataSets(metaHeaderDataSet, dataSet);
        }

        // This is where we actually start parsing
        return parseTheByteStream();
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

    function parseDicomDataSetExplicit(byteStream, maxPosition) {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        maxPosition = maxPosition ||byteStream.byteArray.length;

        var elements = {};

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.parseDicomElementExplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function parseDicomDataSetImplicit(byteStream, maxPosition) {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        maxPosition = maxPosition ? maxPosition : byteStream.byteArray.length;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.parseDicomElementImplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    dicomParser.parseDicomDataSetExplicit = parseDicomDataSetExplicit;
    dicomParser.parseDicomDataSetImplicit = parseDicomDataSetImplicit;

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

    function readTag(byteStream)
    {
        var groupNumber =  byteStream.readUint16() * 256 * 256;
        var elementNumber = byteStream.readUint16();
        var tag = "x" + ('00000000' + (groupNumber + elementNumber).toString(16)).substr(-8);
        return tag;
    }

    dicomParser.parseDicomElementImplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : readTag(byteStream),
            length : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        byteStream.seek(element.length);
        return element;
    };

    dicomParser.parseDicomElementExplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : readTag(byteStream),
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

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.parseSequenceItemsExplicit(byteStream, element);
        }
        else {
            // TODO: Handle undefined length for OB,OW and UN
            byteStream.seek(element.length);
        }


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

    function parseDicomDataSetExplicitUndefinedLength(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.parseDicomElementExplicit(byteStream);
            elements[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArray, elements);
            }

        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function readSequenceItem(byteStream)
    {
        var item = dicomParser.parseDicomElementImplicit(byteStream);

        if(item.length === -1)
        {
            byteStream.seek(1);
            item.dataSet = parseDicomDataSetExplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetExplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function parseSQElementUndefinedLengthExplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItem(byteStream);
            element.items.push(item);

            // If this is the sequence delimitiation item, return the offset of the next element
            if(item.tag === 'xfffee0dd')
            {
                // sequence delimitation item, update attr data length and return
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }

        // Buffer overread!  Set the length of the element to reflect the end of buffer so
        // the caller has access to what we were able to parse.
        // TODO: Figure out how to communicate parse errors like this to the caller
        element.length = byteStream.position - element.dataOffset;
    }

    function parseSQElementKnownLengthExplicit(data, element, explicit)
    {
        /*
        element.items = [];
        var offset = element.dataOffset;
        while(offset < element.dataOffset + element.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);
        }
        */
    }

    dicomParser.parseSequenceItemsExplicit = function(byteStream, element)
    {
        if(element.length === -1)
        {
            parseSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            throw 'not implemented';
            //parseSQElementKnownLengthExplicit(byteStream, element);
        }
    };


    return dicomParser;
}(dicomParser));