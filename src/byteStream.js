import sharedCopy from './sharedCopy.js';
import { readFixedString } from './byteArrayParser.js';
import { invalidParameter, missingParameter } from './util/errors.js';

/**
 *
 * Internal helper class to assist with parsing. Supports reading from a byte
 * stream contained in a Uint8Array.  Example usage:
 *
 *  var byteArray = new Uint8Array(32);
 *  var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
 *
 * */

export default class ByteStream {
  /**
   * Constructor for ByteStream objects.
   * @param byteArrayParser a parser for parsing the byte array
   * @param {Uint8Array | Buffer} byteArray a Uint8Array containing the byte stream
   * @param {number} position (optional) the position to start reading from.  0 if not specified
   * @constructor
   * @throws {TypeError} missing or invalid `byteArrayParser` or `byteArray` parameter
   * @throws {RangeError} incorrect start `position` parameter
   */
  constructor (byteArrayParser, byteArray, position = 0) {
    if (byteArrayParser === undefined) {
      throw new TypeError(missingParameter('byteArrayParser'));
    }
    if (byteArray === undefined) {
      throw new TypeError(missingParameter('byteArray'));
    }
    if ((byteArray instanceof Uint8Array) === false &&
          ((typeof Buffer === 'undefined') ||
          (byteArray instanceof Buffer) === false)) {
      throw new TypeError(invalidParameter('byteArray', 'should be of type Uint8Array or Buffer'));
    }
    if (position < 0) {
      throw new RangeError(`ByteStream start position should be a positive integer or 0, got ${position.toString(10)}`);
    }
    if (position >= byteArray.length) {
      throw new RangeError('ByteStream start position should be a positive integer strictly smaller than byteArray' +
          `length (${byteArray.length}), got ${position.toString(10)}`);
    }
    this.byteArrayParser = byteArrayParser;
    this.byteArray = byteArray;

    this.position = position;
    this.warnings = []; // array of string warnings encountered while parsing
  }

  /**
     * Safely seeks through the byte stream.
     * @param {number} offset the number of bytes to add to the position
     * @throws {RangeError} seek would cause position to be outside the byteArray
     */
  seek (offset) {
    const newPosition = this.position + offset;

    if (newPosition < 0) {
      throw new RangeError(
        `ByteStream cannot seek outside the byteArray tried to read position ${newPosition.toString(10)}`
      );
    }
    this.position = newPosition;
  }

  /**
     * Returns a new ByteStream object from the current position and of the requested number of bytes
     * @param numBytes the length of the byte array for the ByteStream to contain
     * @returns {dicomParser.ByteStream}
     * @throws {RangeError} error if buffer overflow would occur
     */
  readByteStream (numBytes) {
    if (this.position + numBytes > this.byteArray.length) {
      throw new RangeError('Attempted to read stream past buffer end');
    }
    var byteArrayView = sharedCopy(this.byteArray, this.position, numBytes);

    this.position += numBytes;

    return new ByteStream(this.byteArrayParser, byteArrayView);
  }

  getSize () {
    return this.byteArray.length;
  }

  /**
     *
     * Parses an unsigned int 16 from a byte array and advances
     * the position by 2 bytes
     *
     * @returns {*} the parsed unsigned int 16
     * @throws {RangeError} tried to read outside the buffer
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
     * @throws {RangeError} tried to read outside the buffer
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
     * @throws {RangeError} tried to read outside the buffer
     */
  readFixedString (length) {
    var result = readFixedString(this.byteArray, this.position, length);

    this.position += length;

    return result;
  }
}
