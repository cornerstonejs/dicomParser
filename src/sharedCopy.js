/**
 *
 * Internal helper function to create a shared copy of a byteArray
 *
 */

/**
 * Creates a view of the underlying byteArray.  The view is of the same type as the byteArray (e.g.
 * Uint8Array or Buffer) and shares the same underlying memory (changing one changes the other)
 * @param byteArray the underlying byteArray (either Uint8Array or Buffer)
 * @param byteOffset offset into the underlying byteArray to create the view of
 * @param length number of bytes in the view
 * @returns {object} Uint8Array or Buffer depending on the type of byteArray
 */
export default function sharedCopy (byteArray, byteOffset, length) {
  if (typeof Buffer !== 'undefined' && byteArray instanceof Buffer) {
    return byteArray.slice(byteOffset, byteOffset + length);
  } else if (byteArray instanceof Uint8Array) {
    return new Uint8Array(byteArray.buffer, byteArray.byteOffset + byteOffset, length);
  }
  throw 'dicomParser.from: unknown type for byteArray';
}
