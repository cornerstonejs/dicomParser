/**
 *
 * Internal helper functions to assist with allocating buffers.
 *
 */
var dicomParser = (function (dicomParser)
{
  "use strict";

  if(dicomParser === undefined)
  {
    dicomParser = {};
  }

  /**
   * Creates a view of the underlying byteArray.  The view is of the same type as the byteArray (e.g.
   * Uint8Array or Buffer) and shares the same underlying memory (changing one changes the other)
   * @param byteArray the underlying byteArray (either Uint8Array or Buffer)
   * @param byteOffset offset into the underlying byteArray to create the view of
   * @param length number of bytes in the view
   * @returns {object} Uint8Array or Buffer depending on the type of byteArray
   */
  dicomParser.from = function(byteArray, byteOffset, length) {
    if (typeof Buffer !== 'undefined' && byteArray instanceof Buffer) {
      return Buffer.from(byteArray, byteOffset, length);
    }
    else if(byteArray instanceof Uint8Array) {
      return new Uint8Array(byteArray.buffer, byteOffset, length);
    } else {
      throw 'dicomParser.from: unknown type for byteArray';
    }
  };

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