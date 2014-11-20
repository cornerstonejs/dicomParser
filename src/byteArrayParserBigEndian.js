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
     * Parses an unsigned int 16 from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parsed unsigned int 16
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianUint16 = function(byteArray, position)
    {
        if(position < 0) {
            throw 'dicomParser.readBigEndianUint16: position cannot be less than 0';
        }
        if(position + 2 > byteArray.length) {
            throw 'dicomParser.readBigEndianUint16: attempt to read past end of buffer';
        }
        return 256 * byteArray[position] + byteArray[position + 1];
    };


    /**
     *
     * Parses a signed int 16 from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parsed signed int 16
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianInt16 = function(byteArray, position)
    {
        if(position < 0) {
            throw 'dicomParser.readBigEndianInt16: position cannot be less than 0';
        }
        if(position + 2 > byteArray.length) {
            throw 'dicomParser.readBigEndianInt16: attempt to read past end of buffer';
        }
        var int16 = (byteArray[position] << 8) + byteArray[position + 1];
        // fix sign
        if(int16 & 0x8000)
        {
            int16 = int16 - 0x10000; // int16 - 0xFFFF - 1;
        }
        return int16;
    };

    /**
     * Parses an unsigned int 32 from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianUint32 = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readBigEndianUint32: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readBigEndianUint32: attempt to read past end of buffer';
        }

        var uint32 = 256 * (256 * (256 * byteArray[position] +
                     byteArray[position + 1]) +
                     byteArray[position + 2]) +
                     byteArray[position + 3];

        return uint32;
    };

    /**
     * Parses a signed int 32 from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianInt32 = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readBigEndianInt32: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readBigEndianInt32: attempt to read past end of buffer';
        }

        var int32 = (byteArray[position] << 24) +
                    (byteArray[position + 1] << 16) +
                    (byteArray[position + 2] << 8) +
                    byteArray[position + 3];

        return int32;
    };

    /**
     * Parses 32 bit float from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse 32 bit float
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianFloat = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readBigEndianFloat: position cannot be less than 0';
        }

        if(position + 4 > byteArray.length) {
            throw 'dicomParser.readBigEndianFloat: attempt to read past end of buffer';
        }

        // I am sure there is a better way than this but this should be safe
        var byteArrayForParsingFloat= new Uint8Array(4);
        byteArrayForParsingFloat[3] = byteArray[position];
        byteArrayForParsingFloat[2] = byteArray[position + 1];
        byteArrayForParsingFloat[1] = byteArray[position + 2];
        byteArrayForParsingFloat[0] = byteArray[position + 3];
        var floatArray = new Float32Array(byteArrayForParsingFloat.buffer);
        return floatArray[0];
    };

    /**
     * Parses 64 bit float from a big endian byte stream
     *
     * @param byteArray the byteArray to read from
     * @param position the position in the byte array to read from
     * @returns {*} the parse 32 bit float
     * @throws error if buffer overread would occur
     * @access private
     */
    dicomParser.readBigEndianDouble = function(byteArray, position)    {
        if(position < 0)
        {
            throw 'dicomParser.readBigEndianDouble: position cannot be less than 0';
        }

        if(position + 8 > byteArray.length) {
            throw 'dicomParser.readBigEndianDouble: attempt to read past end of buffer';
        }

        // I am sure there is a better way than this but this should be safe
        var byteArrayForParsingFloat= new Uint8Array(8);
        byteArrayForParsingFloat[7] = byteArray[position];
        byteArrayForParsingFloat[6] = byteArray[position + 1];
        byteArrayForParsingFloat[5] = byteArray[position + 2];
        byteArrayForParsingFloat[4] = byteArray[position + 3];
        byteArrayForParsingFloat[3] = byteArray[position + 4];
        byteArrayForParsingFloat[2] = byteArray[position + 5];
        byteArrayForParsingFloat[1] = byteArray[position + 6];
        byteArrayForParsingFloat[0] = byteArray[position + 7];
        var floatArray = new Float64Array(byteArrayForParsingFloat.buffer);
        return floatArray[0];
    };


    return dicomParser;
}(dicomParser));