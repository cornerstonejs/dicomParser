import { overflowErrorMessage, underflowErrorMessage } from './util/errors.js';

/**
 * Internal helper functions for parsing different types from a big-endian byte array
 */
export default {

  /**
     *
     * Parses an unsigned int 16 from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed unsigned int 16
     * @throws {RangeError} tried to read outside the buffer
     * @access private
     */
  readUint16 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }
    if (position + 2 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    return (byteArray[position] << 8) + byteArray[position + 1];
  },

  /**
     *
     * Parses a signed int 16 from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed signed int 16
     * @throws {RangeError} tried to read outside the buffer
     * @access private
     */
  readInt16 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }
    if (position + 2 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }
    var int16 = (byteArray[position] << 8) + byteArray[position + 1];
    // fix sign

    if (int16 & 0x8000) {
      int16 = int16 - 0xFFFF - 1;
    }

    return int16;
  },

  /**
     * Parses an unsigned int 32 from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed unsigned int 32
     * @throws {RangeError} tried to read outside the buffer
     * @access private
     */
  readUint32 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 4 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    var uint32 = (256 * (256 * (256 * byteArray[position] +
                                          byteArray[position + 1]) +
                                          byteArray[position + 2]) +
                                          byteArray[position + 3]);

    return uint32;
  },

  /**
     * Parses a signed int 32 from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed signed int 32
     * @throws {RangeError} tried to read outside the buffer
     * @access private
     */
  readInt32 (byteArray, position) {
    if (position < 0) {
      throw new RangeError(underflowErrorMessage);
    }

    if (position + 4 > byteArray.length) {
      throw new RangeError(overflowErrorMessage);
    }

    var int32 = ((byteArray[position] << 24) +
                     (byteArray[position + 1] << 16) +
                     (byteArray[position + 2] << 8) +
                      byteArray[position + 3]);

    return int32;
  },

  /**
     * Parses 32-bit float from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed 32-bit float
     * @throws {RangeError} tried to read outside the buffer
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
    var byteArrayForParsingFloat = new Uint8Array(4);

    byteArrayForParsingFloat[3] = byteArray[position];
    byteArrayForParsingFloat[2] = byteArray[position + 1];
    byteArrayForParsingFloat[1] = byteArray[position + 2];
    byteArrayForParsingFloat[0] = byteArray[position + 3];
    var floatArray = new Float32Array(byteArrayForParsingFloat.buffer);


    return floatArray[0];
  },

  /**
     * Parses 64-bit float from a big-endian byte array
     *
     * @param byteArray the byte array to read from
     * @param position the position in the byte array to read from
     * @returns {number} the parsed 64-bit float
     * @throws {RangeError} tried to read outside the buffer
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
    var byteArrayForParsingFloat = new Uint8Array(8);

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
  }
};
