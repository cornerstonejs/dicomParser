/**
 * Internal helper functions for parsing different types from a little-endian byte array
 */
import { overflowErrorMessage, underflowErrorMessage } from './util/errors.js';

export default {

  /**
   *
   * Parses an unsigned int 16 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param {number} position the position in the byte array to read from
   * @returns {number} the parsed unsigned int 16
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readUint16 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 2 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    return byteArray[position] + (byteArray[position + 1] * 256);
  },

  /**
   *
   * Parses a signed int 16 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {number} the parsed signed int 16
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readInt16 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }
    if (position + 2 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    let int16 = byteArray[position] + (byteArray[position + 1] << 8);

    // fix sign
    if (int16 & 0x8000) {
      int16 = int16 - 0xFFFF - 1;
    }

    return int16;
  },


  /**
   * Parses an unsigned int 32 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {number} the parsed unsigned int 32
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readUint32 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 4 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    return (byteArray[position] +
           (byteArray[position + 1] * 256) +
           (byteArray[position + 2] * 256 * 256) +
           (byteArray[position + 3] * 256 * 256 * 256));
  },

  /**
 * Parses a signed int 32 from a little-endian byte array
 *
 * @param byteArray the byte array to read from
 * @param position the position in the byte array to read from
   * @returns {number} the parsed unsigned int 32
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readInt32 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 4 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    return (byteArray[position] +
           (byteArray[position + 1] << 8) +
           (byteArray[position + 2] << 16) +
           (byteArray[position + 3] << 24));
  },

  /**
   * Parses 32-bit float from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {number} the parsed 32-bit float
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readFloat (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 4 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    // I am sure there is a better way than this but this should be safe
    const byteArrayForParsingFloat = new Uint8Array(4);

    byteArrayForParsingFloat[0] = byteArray[position];
    byteArrayForParsingFloat[1] = byteArray[position + 1];
    byteArrayForParsingFloat[2] = byteArray[position + 2];
    byteArrayForParsingFloat[3] = byteArray[position + 3];

    const floatArray = new Float32Array(byteArrayForParsingFloat.buffer);

    return floatArray[0];
  },

  /**
   * Parses 64-bit float from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {number} the parsed 64-bit float
   * @throws {RangeError} tried to read outside of buffer
   * @access private
   */
  readDouble (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 8 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    // I am sure there is a better way than this but this should be safe
    const byteArrayForParsingFloat = new Uint8Array(8);

    byteArrayForParsingFloat[0] = byteArray[position];
    byteArrayForParsingFloat[1] = byteArray[position + 1];
    byteArrayForParsingFloat[2] = byteArray[position + 2];
    byteArrayForParsingFloat[3] = byteArray[position + 3];
    byteArrayForParsingFloat[4] = byteArray[position + 4];
    byteArrayForParsingFloat[5] = byteArray[position + 5];
    byteArrayForParsingFloat[6] = byteArray[position + 6];
    byteArrayForParsingFloat[7] = byteArray[position + 7];

    const floatArray = new Float64Array(byteArrayForParsingFloat.buffer);

    return floatArray[0];
  }
};
