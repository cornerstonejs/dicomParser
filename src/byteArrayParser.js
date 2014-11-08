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