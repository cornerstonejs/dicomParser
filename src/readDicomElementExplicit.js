/**
 * Internal helper functions for for parsing DICOM elements
 */

const readTag = require('./readTag');
const readSequenceItemsExplicit = require('./readSequenceItemsExplicit');
const findEndOfEncapsulatedElement = require('./findEndOfEncapsulatedElement');
const findItemDelimitationItemAndSetElementLength = require('./findItemDelimitationItemAndSetElementLength');

function getDataLengthSizeInBytesForVR (vr) {
  switch (vr) {
    case 'QB':
    case 'OW':
    case 'SQ':
    case 'OF':
    case 'UT':
    case 'UN':
      return 4;
      break;
    default:
      return 2;
  }
}

module.exports = function readDicomElementExplicit (byteStream, warnings, untilTag) {
  if (byteStream === undefined) {
    throw "missing required parameter 'byteStream'";
  }

  var element = {
    tag : readTag(byteStream),
    vr : byteStream.readFixedString(2)
    // length set below based on VR
    // dataOffset set below based on VR and size of length
  };

  var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);
  if (dataLengthSizeBytes === 2) {
    element.length = byteStream.readUint16();
    element.dataOffset = byteStream.position;
  
  } else {
    byteStream.seek(2);
    element.length = byteStream.readUint32();
    element.dataOffset = byteStream.position;
  }

  if (element.length === 4294967295) {
    element.hadUndefinedLength = true;
  }

  if (element.tag === untilTag) {
    return element;
  }

  // if VR is SQ, parse the sequence items
  if (element.vr === 'SQ') {
    readSequenceItemsExplicit(byteStream, element, warnings);
    return element;
  }
  if (element.length === 4294967295) {
    if (element.tag === 'x7fe00010') {
      findEndOfEncapsulatedElement(byteStream, element, warnings);
      return element;
    } else {
      findItemDelimitationItemAndSetElementLength(byteStream, element);
      return element;
    }
  }

  byteStream.seek(element.length);
  return element;
};
