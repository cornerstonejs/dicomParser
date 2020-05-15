import findEndOfEncapsulatedElement from './findEndOfEncapsulatedPixelData';
import readTag from './readTag';
import findItemDelimitationItemAndSetElementLength from './findItemDelimitationItem';
import readSequenceItemsExplicit from './readSequenceElementExplicit';
import { IByteStream, IDataSetElement } from './types';
import readSequenceItemsImplicit from './readSequenceElementImplicit';

/**
 * Internal helper functions for for parsing DICOM elements
 */

// http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
// https://github.com/cornerstonejs/dicomParser/pull/102
const getDataLengthSizeInBytesForVR = (vr: string): number => {
  if (
    vr === 'OB' ||
    vr === 'OD' ||
    vr === 'OL' ||
    vr === 'OW' ||
    vr === 'SQ' ||
    vr === 'OF' ||
    vr === 'UC' ||
    vr === 'UR' ||
    vr === 'UT' ||
    vr === 'UN'
  ) {
    return 4;
  }
  return 2;
};

const readDicomElementExplicit = (
  byteStream: IByteStream,
  warnings?: string[],
  untilTag?: string
): IDataSetElement => {
  if (byteStream === undefined) {
    throw new Error('dicomParser.readDicomElementExplicit: missing required parameter \'byteStream\'');
  }

  const element: any = {
    tag: readTag(byteStream),
    vr: byteStream.readFixedString(2),
    // length set below based on VR
    // dataOffset set below based on VR and size of length
  };

  const dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);

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
    } else if (element.vr === 'UN') {
      readSequenceItemsImplicit(byteStream, element);
      return element;
    }

    findItemDelimitationItemAndSetElementLength(byteStream, element);

    return element;
  }

  byteStream.seek(element.length);

  return element;
};
export default readDicomElementExplicit;
