/**
 * Internal helper functions for parsing different types from a little-endian byte array
 */


module.exports = {
  /**
   *
   * Parses an unsigned int 16 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed unsigned int 16
   * @throws error if buffer overread would occur
   * @access private
   */
  readUint16: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }
    if (position + 2 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }
    return byteArray[position] + (byteArray[position + 1] * 256);
  },

  /**
   *
   * Parses a signed int 16 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed signed int 16
   * @throws error if buffer overread would occur
   * @access private
   */
  readInt16: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }

    if (position + 2 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }

    var int16 = byteArray[position] + (byteArray[position + 1] << 8);
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
   * @returns {*} the parsed unsigned int 32
   * @throws error if buffer overread would occur
   * @access private
   */
  readUint32: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }

    if (position + 4 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }

    var uint32 = (byteArray[position] +
                 (byteArray[position + 1] * 256) +
                 (byteArray[position + 2] * 256 * 256) +
                 (byteArray[position + 3] * 256 * 256 * 256 ));

    return uint32;
  },

  /**
   * Parses a signed int 32 from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed unsigned int 32
   * @throws error if buffer overread would occur
   * @access private
   */
  readInt32: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }

    if (position + 4 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }

    var int32 = (byteArray[position] +
                (byteArray[position + 1] << 8) +
                (byteArray[position + 2] << 16) +
                (byteArray[position + 3] << 24));

    return int32;
  },

  /**
   * Parses 32-bit float from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed 32-bit float
   * @throws error if buffer overread would occur
   * @access private
   */
  readFloat: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }

    if (position + 4 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }

    // I am sure there is a better way than this but this should be safe
    var byteArrayForParsingFloat = new Uint8Array(4);
    byteArrayForParsingFloat.forEach(function (val, index) {
      byteArrayForParsingFloat[index] = byteArrayForParsingFloat[position + index];
    });

    var floatArray = new Float32Array(byteArrayForParsingFloat.buffer);
    return floatArray[0];
  },

  /**
   * Parses 64-bit float from a little-endian byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed 64-bit float
   * @throws error if buffer overread would occur
   * @access private
   */
  readDouble: function (byteArray, position) {
    if (position < 0) {
      throw 'position cannot be less than 0';
    }

    if (position + 8 > byteArray.length) {
      throw 'attempt to read past end of buffer';
    }

    var byteArrayForParsingFloat = new Uint8Array(8);
    byteArrayForParsingFloat.forEach(function (val, index) {
      byteArrayForParsingFloat[index] = byteArrayForParsingFloat[position + index];
    });

    var floatArray = new Float64Array(byteArrayForParsingFloat.buffer);
    return floatArray[0];
  }
};
