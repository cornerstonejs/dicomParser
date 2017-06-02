/**
 * Internal helper functions for parsing DICOM elements
 */

/**
 * Reads a tag (group number and element number) from a byteStream
 * @param byteStream the byte stream to read from
 * @returns {string} the tag in format xggggeeee where gggg is the lowercase hex value of the group number
 * and eeee is the lower case hex value of the element number
 */
export default function readTag (byteStream) {
  if (byteStream === undefined) {
    throw 'dicomParser.readTag: missing required parameter \'byteStream\'';
  }

  const groupNumber = byteStream.readUint16() * 256 * 256;
  const elementNumber = byteStream.readUint16();
  const tag = `x${(`00000000${(groupNumber + elementNumber).toString(16)}`).substr(-8)}`;

  return tag;
}
