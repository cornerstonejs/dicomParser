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