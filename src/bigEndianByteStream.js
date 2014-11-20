/**
 *
 * Interal helper class to assist with parsing class supports reading from a big endian byte
 * stream contained in an Uint8Array.  Example usage:
 *
 *  var byteArray = new Uint8Array(32);
 *  var byteStream = new dicomParser.BigEndianByteStream(byteArray);
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
     * Constructor for BigEndianByteStream objects.
     * @param byteArray a Uint8Array containing the byte stream
     * @param position (optional) the position to start reading from.  0 if not specified
     * @constructor
     * @throws will throw an error the byteArray parameter is not present or invalid
     * @throws will throw an error the position parameter is not inside the byteArray
     */
    dicomParser.BigEndianByteStream = function(byteArray, position) {
        if(byteArray === undefined)
        {
            throw "dicomParser.BigEndianByteStream: missing required parameter 'byteArray'";
        }
        if((byteArray instanceof Uint8Array) === false) {
            throw 'dicomParser.BigEndianByteStream: parameter byteArray is not of type Uint8Array';
        }
        if(position < 0)
        {
            throw "dicomParser.BigEndianByteStream: parameter 'position' cannot be less than 0";
        }
        if(position >= byteArray.length)
        {
            throw "dicomParser.BigEndianByteStream: parameter 'position' cannot be greater than or equal to 'byteArray' length";

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
    dicomParser.BigEndianByteStream.prototype.seek = function(offset)
    {
        if(this.position + offset < 0)
        {
            throw "cannot seek to position < 0";
        }
        this.position += offset;
    };

    /**
     * Returns a new BigEndianByteStream object from the current position and of the requested number of bytes
     * @param numBytes the length of the byteArray for the BigEndianByteStream to contain
     * @returns {dicomParser.BigEndianByteStream}
     * @throws error if buffer overread would occur
     */
    dicomParser.BigEndianByteStream.prototype.readByteStream = function(numBytes)
    {
        if(this.position + numBytes > this.byteArray.length) {
            throw 'readByteStream - buffer overread';
        }
        var byteArrayView = new Uint8Array(this.byteArray.buffer, this.position, numBytes);
        this.position += numBytes;
        return new dicomParser.BigEndianByteStream(byteArrayView);
    };

    /**
     *
     * Parses an unsigned int 16 from a big endian byte stream and advances
     * the position by 2 bytes
     *
     * @returns {*} the parsed unsigned int 16
     * @throws error if buffer overread would occur
     */
    dicomParser.BigEndianByteStream.prototype.readUint16 = function()
    {
        var result = dicomParser.readBigEndianUint16(this.byteArray, this.position);
        this.position += 2;
        return result;
    };

    /**
     * Parses an unsigned int 32 from a big endian byte stream and advances
     * the position by 2 bytes
     *
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     */
    dicomParser.BigEndianByteStream.prototype.readUint32 = function()
    {
        var result = dicomParser.readBigEndianUint32(this.byteArray, this.position);
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
    dicomParser.BigEndianByteStream.prototype.readFixedString = function(length)
    {
        var result = dicomParser.readFixedString(this.byteArray, this.position, length);
        this.position += length;
        return result;

    };

    return dicomParser;
}(dicomParser));