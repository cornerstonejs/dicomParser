import ByteStream from './byteStream.js';
import DataSet from './dataSet.js';
import littleEndianByteArrayParser from './littleEndianByteArrayParser.js';
import readDicomElementExplicit from './readDicomElementExplicit.js';

/**
 * Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements.  If the options
 * argument is supplied and it contains the untilTag property, parsing will stop once that
 * tag is encoutered.  This can be used to parse partial byte streams.
 *
 * @param byteArray the byte array
 * @param options Optional options values
 *    TransferSyntaxUID: String to specify a default raw transfer syntax UID.
 *        Use the LEI transfer syntax for raw files, or the provided one for SCP transfers.
 * @returns {DataSet}
 * @throws error if an error occurs while parsing.  The exception object will contain a property dataSet with the
 *         elements successfully parsed before the error.
 */

export default function readPart10Header (byteArray, options = {}) {
  if (byteArray === undefined) {
    throw 'dicomParser.readPart10Header: missing required parameter \'byteArray\'';
  }

  const { TransferSyntaxUID } = options;
  const littleEndianByteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

  function readPrefix() {
    if (littleEndianByteStream.getSize() <= 132 && TransferSyntaxUID) {
      return false;
    }
    littleEndianByteStream.seek(128);
    const prefix = littleEndianByteStream.readFixedString(4);

    if (prefix !== 'DICM') {
      const { TransferSyntaxUID } = options || {};
      if (!TransferSyntaxUID) {
        throw 'dicomParser.readPart10Header: DICM prefix not found at location 132 - this is not a valid DICOM P10 file.';
      }
      littleEndianByteStream.seek(0);
      return false;
    }
    return true;
  }

  // main function here
  function readTheHeader() {
    // Per the DICOM standard, the header is always encoded in Explicit VR Little Endian (see PS3.10, section 7.1)
    // so use littleEndianByteStream throughout this method regardless of the transfer syntax
    const isPart10 = readPrefix();

    const warnings = [];
    const elements = {};

    if (!isPart10) {
      littleEndianByteStream.position = 0;
      const metaHeaderDataSet = {
        elements: { x00020010: { tag: 'x00020010', vr: 'UI', Value: TransferSyntaxUID } },
        warnings,
      };
      // console.log('Returning metaHeaderDataSet', metaHeaderDataSet);
      return metaHeaderDataSet;
    }

    while (littleEndianByteStream.position < littleEndianByteStream.byteArray.length) {
      const position = littleEndianByteStream.position;
      const element = readDicomElementExplicit(littleEndianByteStream, warnings);

      if (element.tag > 'x0002ffff') {
        littleEndianByteStream.position = position;
        break;
      }
      // Cache the littleEndianByteArrayParser for meta header elements, since the rest of the data set may be big endian
      // and this parser will be needed later if the meta header values are to be read.
      element.parser = littleEndianByteArrayParser;
      elements[element.tag] = element;
    }

    const metaHeaderDataSet = new DataSet(littleEndianByteStream.byteArrayParser, littleEndianByteStream.byteArray, elements);

    metaHeaderDataSet.warnings = littleEndianByteStream.warnings;
    metaHeaderDataSet.position = littleEndianByteStream.position;

    return metaHeaderDataSet;
  }

  // This is where we actually start parsing
  return readTheHeader();
}
