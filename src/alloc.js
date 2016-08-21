/**
 *
 * Internal helper function to allocate new byteArray buffers
 */
var dicomParser = (function (dicomParser)
{
  "use strict";

  if(dicomParser === undefined)
  {
    dicomParser = {};
  }

  /**
   * Creates a new byteArray of the same type (Uint8Array or Buffer) of the specified length.
   * @param byteArray the underlying byteArray (either Uint8Array or Buffer)
   * @param length number of bytes of the Byte Array
   * @returns {object} Uint8Array or Buffer depending on the type of byteArray
   */
  dicomParser.alloc = function(byteArray, length) {
    if (typeof Buffer !== 'undefined' && byteArray instanceof Buffer) {
      return Buffer.alloc(length);
    }
    else if(byteArray instanceof Uint8Array) {
      return new Uint8Array(length);
    } else {
      throw 'dicomParser.alloc: unknown type for byteArray';
    }
  };

  return dicomParser;
}(dicomParser));