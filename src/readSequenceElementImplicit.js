import DataSet from './dataSet.js';
import readDicomElementImplicit from './readDicomElementImplicit.js';
import readSequenceItem from './readSequenceItem.js';
import readTag from './readTag.js';
import * as parseDicomDataSet from './parseDicomDataSet.js';

/**
 * Internal helper functions for parsing DICOM elements
 */

function readDicomDataSetImplicitUndefinedLength (byteStream, vrCallback) {
  const elements = {};

  while (byteStream.position < byteStream.byteArray.length) {
    const element = readDicomElementImplicit(byteStream, undefined, vrCallback);

    elements[element.tag] = element;

    // we hit an item delimiter tag, return the current offset to mark
    // the end of this sequence item
    if (element.tag === 'xfffee00d') {
      return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
    }
  }

  // eof encountered - log a warning and return what we have for the element
  byteStream.warnings.push('eof encountered before finding sequence item delimiter in sequence item of undefined length');

  return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
}

function readSequenceItemImplicit (byteStream, vrCallback) {
  const item = readSequenceItem(byteStream);

  if (item.length === 4294967295) {
    item.hadUndefinedLength = true;
    item.dataSet = readDicomDataSetImplicitUndefinedLength(byteStream, vrCallback);
    item.length = byteStream.position - item.dataOffset;
  } else {
    item.dataSet = new DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
    parseDicomDataSet.parseDicomDataSetImplicit(item.dataSet, byteStream, byteStream.position + item.length, { vrCallback });
  }

  return item;
}

function readSQElementUndefinedLengthImplicit (byteStream, element, vrCallback) {
  while ((byteStream.position + 4) <= byteStream.byteArray.length) {
    // end reading this sequence if the next tag is the sequence delimitation item
    const nextTag = readTag(byteStream);

    byteStream.seek(-4);

    if (nextTag === 'xfffee0dd') {
      // set the correct length
      element.length = byteStream.position - element.dataOffset;
      byteStream.seek(8);

      return element;
    }

    const item = readSequenceItemImplicit(byteStream, vrCallback);

    element.items.push(item);
  }

  byteStream.warnings.push('eof encountered before finding sequence delimiter in sequence of undefined length');
  element.length = byteStream.byteArray.length - element.dataOffset;
}

function readSQElementKnownLengthImplicit (byteStream, element, vrCallback) {
  const maxPosition = element.dataOffset + element.length;

  while (byteStream.position < maxPosition) {
    const item = readSequenceItemImplicit(byteStream, vrCallback);

    element.items.push(item);
  }
}

/**
 * Reads sequence items for an element in an implicit little endian byte stream
 * @param byteStream the implicit little endian byte stream
 * @param element the element to read the sequence items for
 * @param vrCallback an optional method that returns a VR string given a tag
 */
export default function readSequenceItemsImplicit (byteStream, element, vrCallback) {
  if (byteStream === undefined) {
    throw 'dicomParser.readSequenceItemsImplicit: missing required parameter \'byteStream\'';
  }

  if (element === undefined) {
    throw 'dicomParser.readSequenceItemsImplicit: missing required parameter \'element\'';
  }

  element.items = [];

  if (element.length === 4294967295) {
    readSQElementUndefinedLengthImplicit(byteStream, element, vrCallback);
  } else {
    readSQElementKnownLengthImplicit(byteStream, element, vrCallback);
  }
}
