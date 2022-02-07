import sharedCopy from './sharedCopy.js';
import { readFixedString } from './byteArrayParser.js';

/**
 *
 * Internal helper class to assist with parsing. Supports reading from a byte
 * stream contained in a Uint8Array.  Example usage:
 *
 *  var byteArray = new Uint8Array(32);
 *  var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
 *
 * */

/**
 * Constructor for ByteStream objects.
 * @param byteArrayParser a parser for parsing the byte array
 * @param byteArray a Uint8Array containing the byte stream
 * @param position (optional) the position to start reading from.  0 if not specified
 * @constructor
 * @throws will throw an error if the byteArrayParser parameter is not present
 * @throws will throw an error if the byteArray parameter is not present or invalid
 * @throws will throw an error if the position parameter is not inside the byte array
 */
export default class ByteStream {
  constructor (byteArrayParser, byteArray, position) {
    if (byteArrayParser === undefined) {
      throw 'dicomParser.ByteStream: missing required parameter \'byteArrayParser\'';
    }
    if (byteArray === undefined) {
      throw 'dicomParser.ByteStream: missing required parameter \'byteArray\'';
    }
    if ((byteArray instanceof Uint8Array) === false &&
          ((typeof Buffer === 'undefined') ||
          (byteArray instanceof Buffer) === false)) {
      throw 'dicomParser.ByteStream: parameter byteArray is not of type Uint8Array or Buffer';
    }
    if (position < 0) {
      throw 'dicomParser.ByteStream: parameter \'position\' cannot be less than 0';
    }
    if (position >= byteArray.length) {
      throw 'dicomParser.ByteStream: parameter \'position\' cannot be greater than or equal to \'byteArray\' length';
    }
    this.byteArrayParser = byteArrayParser;
    this.byteArray = byteArray;
    this.position = position ? position : 0;
    this.warnings = []; // array of string warnings encountered while parsing
  }

  /**
     * Safely seeks through the byte stream.  Will throw an exception if an attempt
     * is made to seek outside of the byte array.
     * @param offset the number of bytes to add to the position
     * @throws error if seek would cause position to be outside of the byteArray
     */
  seek (offset) {
    if (this.position + offset < 0) {
      throw 'dicomParser.ByteStream.prototype.seek: cannot seek to position < 0';
    }
    this.position += offset;
  }

  /**
     * Returns a new ByteStream object from the current position and of the requested number of bytes
     * @param numBytes the length of the byte array for the ByteStream to contain
     * @returns {dicomParser.ByteStream}
     * @throws error if buffer overread would occur
     */
  readByteStream (numBytes) {
    if (this.position + numBytes > this.byteArray.length) {
      throw 'dicomParser.ByteStream.prototype.readByteStream: readByteStream - buffer overread';
    }
    var byteArrayView = sharedCopy(this.byteArray, this.position, numBytes);

    this.position += numBytes;

    return new ByteStream(this.byteArrayParser, byteArrayView);
  }

  getSize() {
    return this.byteArray.length;
  }

  /**
     *
     * Parses an unsigned int 16 from a byte array and advances
     * the position by 2 bytes
     *
     * @returns {*} the parsed unsigned int 16
     * @throws error if buffer overread would occur
     */
  readUint16 () {
    var result = this.byteArrayParser.readUint16(this.byteArray, this.position);

    this.position += 2;

    return result;
  }

  /**
     * Parses an unsigned int 32 from a byte array and advances
     * the position by 2 bytes
     *
     * @returns {*} the parse unsigned int 32
     * @throws error if buffer overread would occur
     */
  readUint32 () {
    var result = this.byteArrayParser.readUint32(this.byteArray, this.position);

    this.position += 4;

    return result;
  }

  /**
     * Reads a string of 8-bit characters from an array of bytes and advances
     * the position by length bytes.  A null terminator will end the string
     * but will not effect advancement of the position.
     * @param length the maximum number of bytes to parse
     * @returns {string} the parsed string
     * @throws error if buffer overread would occur
     */
  readFixedString (length) {
    var result = readFixedString(this.byteArray, this.position, length);

    this.position += length;

    return result;
  }
}
