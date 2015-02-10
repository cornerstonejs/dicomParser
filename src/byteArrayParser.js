/**
 * Internal helper functions common to parsing byte arrays of any type
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Reads a string of 8-bit characters from an array of bytes and advances
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