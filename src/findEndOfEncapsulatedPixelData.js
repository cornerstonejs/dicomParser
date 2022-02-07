import readTag from './readTag.js';

/**
 * Internal helper functions for parsing DICOM elements
 */

/**
 * Reads an encapsulated pixel data element and adds an array of fragments to the element
 * containing the offset and length of each fragment and any offsets from the basic offset
 * table
 * @param byteStream
 * @param element
 */
export default function findEndOfEncapsulatedElement (byteStream, element, warnings) {
  if (byteStream === undefined) {
    throw 'dicomParser.findEndOfEncapsulatedElement: missing required parameter \'byteStream\'';
  }

  if (element === undefined) {
    throw 'dicomParser.findEndOfEncapsulatedElement: missing required parameter \'element\'';
  }

  element.encapsulatedPixelData = true;
  element.basicOffsetTable = [];
  element.fragments = [];

  const basicOffsetTableItemTag = readTag(byteStream);

  if (basicOffsetTableItemTag !== 'xfffee000') {
    throw 'dicomParser.findEndOfEncapsulatedElement: basic offset table not found';
  }

  const basicOffsetTableItemlength = byteStream.readUint32();
  const numFragments = basicOffsetTableItemlength / 4;

  // Bad idea to not include the basic offset table, as it means writing the data out is inconsistent with reading it
  // but leave this for now.  To fix later.
  for (let i = 0; i < numFragments; i++) {
    const offset = byteStream.readUint32();

    element.basicOffsetTable.push(offset);
  }

  const baseOffset = byteStream.position;

  while (byteStream.position < byteStream.byteArray.length) {
    const tag = readTag(byteStream);
    let length = byteStream.readUint32();

    if (tag === 'xfffee0dd') {
      byteStream.seek(length);
      element.length = byteStream.position - element.dataOffset;

      return;
    } else if (tag === 'xfffee000') {
      element.fragments.push({
        offset: byteStream.position - baseOffset - 8,
        position: byteStream.position,
        length
      });
    } else {
      if (warnings) {
        warnings.push(`unexpected tag ${tag} while searching for end of pixel data element with undefined length`);
      }

      if (length > byteStream.byteArray.length - byteStream.position) {
        // fix length
        length = byteStream.byteArray.length - byteStream.position;
      }

      element.fragments.push({
        offset: byteStream.position - baseOffset - 8,
        position: byteStream.position,
        length
      });

      byteStream.seek(length);
      element.length = byteStream.position - element.dataOffset;

      return;
    }

    byteStream.seek(length);
  }

  if (warnings) {
    warnings.push(`pixel data element ${element.tag} missing sequence delimiter tag xfffee0dd`);
  }
}
