import findItemDelimitationItemAndSetElementLength from './findItemDelimitationItem.js';
import readSequenceItemsImplicit from './readSequenceElementImplicit.js';
import readTag from './readTag.js';
import { isPrivateTag } from './util/util.js';

/**
 * Internal helper functions for for parsing DICOM elements
 */

const isSequence = (element, byteStream) => {
  if (element.vr !== undefined) {
    return (element.vr === 'SQ');
  }

  if ((byteStream.position + 4) <= byteStream.byteArray.length) {
    const nextTag = readTag(byteStream);

    byteStream.seek(-4);

    // Item start tag (fffe,e000) or sequence delimiter (i.e. end of sequence) tag (0fffe,e0dd)
    // These are the tags that could potentially be found directly after a sequence start tag (the delimiter
    // is found in the case of an empty sequence). This is not 100% safe because a non-sequence item
    // could have data that has these bytes, but this is how to do it without a data dictionary.
    return (nextTag === 'xfffee000') || (nextTag === 'xfffee0dd');
  }

  byteStream.warnings.push('eof encountered before finding sequence item tag or sequence delimiter tag in peeking to determine VR');

  return false;
};

export default function readDicomElementImplicit (byteStream, untilTag, vrCallback) {
  if (byteStream === undefined) {
    throw 'dicomParser.readDicomElementImplicit: missing required parameter \'byteStream\'';
  }

  const tag = readTag(byteStream);

  const element = {
    tag,
    vr: (vrCallback !== undefined ? vrCallback(tag) : undefined),
    length: byteStream.readUint32(),
    dataOffset: byteStream.position
  };

  if (element.length === 4294967295) {
    element.hadUndefinedLength = true;
  }

  if (element.tag === untilTag) {
    return element;
  }

  // always parse sequences with undefined lengths, since there's no other way to know how long they are.
  if (isSequence(element, byteStream) && (!isPrivateTag(element.tag) || element.hadUndefinedLength)) {
    // parse the sequence
    readSequenceItemsImplicit(byteStream, element, vrCallback);

    if (isPrivateTag(element.tag)) {
      element.items = undefined;
    }

    return element;
  }

  // if element is not a sequence and has undefined length, we have to
  // scan the data for a magic number to figure out when it ends.
  if (element.hadUndefinedLength) {
    findItemDelimitationItemAndSetElementLength(byteStream, element);

    return element;
  }

  // non sequence element with known length, skip over the data part
  byteStream.seek(element.length);

  return element;
}
