import DataSet from './dataSet.js';
import readDicomElementExplicit from './readDicomElementExplicit.js';
import readSequenceItem from './readSequenceItem.js';
import readTag from './readTag.js';
import * as parseDicomDataSet from './parseDicomDataSet.js';

/**
 * Internal helper functions for parsing DICOM elements
 */

function readDicomDataSetExplicitUndefinedLength (byteStream, warnings) {
  const elements = {};

  while (byteStream.position < byteStream.byteArray.length) {
    const element = readDicomElementExplicit(byteStream, warnings);

    elements[element.tag] = element;

    // we hit an item delimiter tag, return the current offset to mark
    // the end of this sequence item
    if (element.tag === 'xfffee00d') {
      return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
    }
  }

  // eof encountered - log a warning and return what we have for the element
  warnings.push('eof encountered before finding item delimiter tag while reading sequence item of undefined length');

  return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
}

function readSequenceItemExplicit (byteStream, warnings) {
  const item = readSequenceItem(byteStream);

  if (item.length === 4294967295) {
    item.hadUndefinedLength = true;
    item.dataSet = readDicomDataSetExplicitUndefinedLength(byteStream, warnings);
    item.length = byteStream.position - item.dataOffset;
  } else {
    item.dataSet = new DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
    parseDicomDataSet.parseDicomDataSetExplicit(item.dataSet, byteStream, byteStream.position + item.length);
  }

  return item;
}

function readSQElementUndefinedLengthExplicit (byteStream, element, warnings) {
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

    const item = readSequenceItemExplicit(byteStream, warnings);

    element.items.push(item);
  }

  warnings.push('eof encountered before finding sequence delimitation tag while reading sequence of undefined length');
  element.length = byteStream.position - element.dataOffset;
}

function readSQElementKnownLengthExplicit (byteStream, element, warnings) {
  const maxPosition = element.dataOffset + element.length;

  while (byteStream.position < maxPosition) {
    const item = readSequenceItemExplicit(byteStream, warnings);

    element.items.push(item);
  }
}

export default function readSequenceItemsExplicit (byteStream, element, warnings) {
  if (byteStream === undefined) {
    throw 'dicomParser.readSequenceItemsExplicit: missing required parameter \'byteStream\'';
  }

  if (element === undefined) {
    throw 'dicomParser.readSequenceItemsExplicit: missing required parameter \'element\'';
  }

  element.items = [];

  if (element.length === 4294967295) {
    readSQElementUndefinedLengthExplicit(byteStream, element, warnings);
  } else {
    readSQElementKnownLengthExplicit(byteStream, element, warnings);
  }
}
