/**
* Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements.  If the options
* argument is supplied and it contains the untilTag property, parsing will stop once that
* tag is encoutered.  This can be used to parse partial byte streams.
*
* @param byteArray the byte array
* @param options object to control parsing behavior (optional)
* @returns {DataSet}
* @throws error if an error occurs while parsing.  The exception object will contain a property dataSet with the
*         elements successfully parsed before the error.
*/

const ByteStream = require('./ByteStream');
const littleEndianByteArrayParser = require('./littleEndianByteArrayParser');
const readDicomElementExplicit = require('./readDicomElementExplicit');
const DataSet = require('./DataSet');

module.exports = function readPart10Header (byteArray, options) {

  if (byteArray === undefined) {
    throw "missing required parameter 'byteArray'";
  }

  var littleEndianByteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

  function readPrefix () {
    littleEndianByteStream.seek(128);
    var prefix = littleEndianByteStream.readFixedString(4);
    if (prefix !== "DICM") {
      throw "DICM prefix not found at location 132 - this is not a valid DICOM P10 file.";
    }
  }

  // main function here
  function readTheHeader () {
    // Per the DICOM standard, the header is always encoded in Explicit VR Little Endian (see PS3.10, section 7.1)
    // so use littleEndianByteStream throughout this method regardless of the transfer syntax
    readPrefix();

    var warnings = [],
        elements = {};
        
    while (littleEndianByteStream.position < littleEndianByteStream.byteArray.length) {
      var position = littleEndianByteStream.position,
          element = readDicomElementExplicit(littleEndianByteStream, warnings);
      if (element.tag > 'x0002ffff') {
        littleEndianByteStream.position = position;
        break;
      }
      // Cache the littleEndianByteArrayParser for meta header elements, since the rest of the data set may be big endian
      // and this parser will be needed later if the meta header values are to be read.
      element.parser = littleEndianByteArrayParser;
      elements[element.tag] = element;
    }
    var metaHeaderDataSet = new DataSet(littleEndianByteStream.byteArrayParser, littleEndianByteStream.byteArray, elements);
    metaHeaderDataSet.warnings = littleEndianByteStream.warnings;
    metaHeaderDataSet.position = littleEndianByteStream.position;
    return metaHeaderDataSet;
  }

  // This is where we actually start parsing
  return readTheHeader();
};


